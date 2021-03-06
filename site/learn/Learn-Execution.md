---
title: 실행
layout: ../_core/DocsLayout
category: Learn
permalink: /learn/execution/
next: /learn/introspection/
---

유효성을 검사 한 후 GraphQL 쿼리는 GraphQL 서버에 의해 실행되어 요청된 쿼리의 형태를 일반적인 JSON 형태의 결과를 반환합니다.

GraphQL은 타입 시스템없이는 쿼리를 실행할 수 없습니다. 예제를 통해 쿼리 실행에 대하여 설명하겠습니다. 이전 예제에서 사용된 것과 동일한 타입 시스템의 일부입니다.

```graphql
type Query {
  human(id: ID!): Human
}

type Human {
  name: String
  appearsIn: [Episode]
  starships: [Starship]
}

enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}

type Starship {
  name: String
}
```

쿼리가 실행될 때 어떤 일이 발생하는지 설명하기 위해 예제를 사용하여 살펴 보겠습니다.

```graphql
# { "graphiql": true }
{
  human(id: 1002) {
    name
    appearsIn
    starships {
      name
    }
  }
}
```

GraphQL 쿼리의 각 필드는 다음 타입을 반환하는 이전 타입의 함수 또는 메소드로 생각할 수 있습니다. 사실 이것은 GraphQL의 작동 방식입니다. 각 타입의 각 필드는 GraphQL 서버 개발자가 만든 *resolver* 함수에 의해 지원됩니다. 필드가 실행되면 해당 *resolver* 가 호출되어 다음 값을 생성합니다.

필드가 문자열이나 숫자와 같은 스칼라 값을 생성하면 실행이 완료됩니다. 그러나 필드가 객체를 생성하면 쿼리는 해당 객체에 적용되는 다른 필드 선택 항목을 포함하게됩니다. 이 스칼라 값에 도달할 때까지 반복됩니다. GraphQL 쿼리는 항상 스칼라 값으로 끝납니다.

## Root fields & resolvers

모든 GraphQL 서버의 최상위 레벨은 GraphQL API에 가능한 모든 진입점을 나타내는 타입으로, *Root* 타입 또는 *Query* 타입이라고도 합니다.

이 예제에서 Query 타입은 인자 `id` 를 받아들이는 `human` 필드를 제공합니다. 이 필드의 *resolver* 함수는 데이터베이스에 액세스 한 다음 `Human` 객체를 생성하고 반환합니다.

```js
Query: {
  human(obj, args, context) {
    return context.db.loadHumanByID(args.id).then(
      userData => new Human(userData)
    )
  }
}
```

이 예제는 자바스크립트로 작성되었지만 GraphQL 서버는 [다양한 언어](/code/)로 만들 수 있습니다. *resolver* 함수는 세 개의 인수를 받습니다.

- `obj`: 루트 쿼리 타입의 필드에 대해 종종 사용되지 않는 이전 객체.
- `args`: GraphQL 쿼리의 필드에 제공된 인수입니다.
- `context`: 모든 *resolver* 함수에 제공되고 현재 로그인한 사용자 또는 데이터베이스에 대한 액세스와 같은 중요한 문맥 정보를 보유하는 값.


## Asynchronous resolvers

이 *resolver* 함수에서 어떤 일이 일어나는지 자세히 살펴보겠습니다.

```js
human(obj, args, context) {
  return context.db.loadHumanByID(args.id).then(
    userData => new Human(userData)
  )
}
```

`context` 는 GraphQL 쿼리에서 인자로 제공된 `id` 에 의해 사용자의 데이터를 로드하는데 사용되는 데이터베이스에 대한 액세스를 위해 사용됩니다. 데이터베이스에서 로딩은 비동기 작업이기 때문에 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)를 반환합니다. JavaScript에서는 ` Promise` 를 사용하여 비동기 값을 처리하지만 동일한 개념이 *Futures* , *Tasks* , *Deferred* 등 여러가지 언어로 존재합니다. 데이터베이스가 반환되면 새로운 `Human` 객체를 생성하고 반환할 수 있습니다.

*resolver* 함수는 `Promise` 를 인식해야하지만 GraphQL 쿼리는 Promise를 인식 할 필요가 없습니다. `human` 필드는 `name` 을 요청할 수 있는 무언가를 반환 할 것입니다. 실행 중에 GraphQL은 `Promises`, `Futures`, `Tasks` 가 완료되기 전에 완료될 때까지 기다렸다가 효율적으로 동시에 처리합니다.


## Trivial resolvers

이제 `Human` 객체를 사용할 수 있게 되었으므로 GraphQL 실행은 요청된 필드를 계속 사용할 수 있습니다.

```js
Human: {
  name(obj, args, context) {
    return obj.name
  }
}
```

GraphQL 서버는 다음에 수행할 작업을 결정하는 타입 시스템에 의해 작동됩니다. `human` 필드가 무언가를 반환하기 전에, GraphQL은 타입 시스템이 `human` 필드가 `Human` 을 반환 할 것이라고 알려주기 때문에 다음 단계는 `Human` 타입의 필드를 반환할 것이라는 것을 알고 있습니다.

이 경우 `name` 을 해석하는 것은 매우 간단합니다. `name` *resolver* 함수가 호출되고 `obj` 인수는 이전 필드에서 반환 된 `new Human` 객체입니다. `Human` 객체는 직접 읽고 반환 할 수 있는 `name` 속성을 가질 것을 알 수 있습니다.

사실, 많은 GraphQL 라이브러리는 *resolver* 를 생략할 수 있게 해주며, *resolver* 가 필드에 제공되지 않으면 같은 이름의 속성을 읽고 반환해야 한다고 가정됩니다.

## Scalar coercion

`name` 필드가 *resolve* 되는 동안 `appearIn` 과 `starships` 필드는 동시에 *resolve* 될 수 있습니다. `appearIn` 필드는 간단한 *resolver* 를 가질 수도 있지만 좀 더 자세히 살펴보도록 하겠습니다.

```js
Human: {
  appearsIn(obj) {
    return obj.appearsIn // returns [ 4, 5, 6 ]
  }
}
```

타입 시스템이 `appearIn` 이 알고있는 Enum 값을 반환한다고 알려주지만 이 함수는 숫자를 반환합니다! 실제로 결과를 살펴보면 적절한 Enum 값이 반환되는 것을 볼 수 있습니다. 어떻게된 일일까요?

이것은 스칼라 강제의 예입니다. 타입 시스템은 어떤 값이 올지 알고 있어서 *resolver* 함수에 의해 리턴된 값을 API 규약을 유지할 수 있는 형태로 변환 할 것입니다. 이 경우 내부적으로 `4`,`5`,`6` 과 같은 숫자를 사용하는 Enum 이 서버에 정의되어 있을 수 있지만 GraphQL 타입 시스템에서는 이를 Enum 값으로 나타냅니다.

## List resolvers

필드가 위의 `appearIn` 필드 리스트를 반환 할 때 어떤 일이 벌어지는지 살펴 보았습니다. 이것은 열거형 값의 *list* 를 반환했으며, 이 때문에 타입 시스템에서 예상한대로 리스트의 각 항목이 적절한 열거형 값으로 강제 변환되었습니다. `starships` 필드가 *resolve* 되면 어떻게 될까요?

```js
Human: {
  starships(obj, args, context) {
    return obj.starshipIDs.map(
      id => context.db.loadStarshipByID(id).then(
        shipData => new Starship(shipData)
      )
    )
  }
}
```

이 필드의 *resolver* 는 `Promise` 를 반환하는 것이 아니라 `Promise`의 *list* 을 반환합니다. `Human` 객체는 이것이 처리한 `Starships` 의 id list 를 가지고 있지만, 실제 `Starship` 객체를 얻으려면 모든 id를 로드해야 합니다.

GraphQL 은 계속하기 전에 이 모든 `Promise` 들을 기다릴 것이고, 객체의 리스트와 함께 남겨질 때 동시에 이 아이템들의 각각에 `name` 필드를 다시 로드 할 것입니다.

## Producing the result

각 필드가 *resolve* 될 때 결과 값은 필드 이름(또는 별칭)을 키로 사용하고 *resolve*된 값을 값으로 사용하여 `key`-`value` 맵에 들어갑니다. 이 방법은 쿼리의 맨 하단 끝 필드에서부터 루트 쿼리 타입의 초기 필드까지 반복됩니다. 최종적으로 기존 쿼리를 미러링하는 구조를 만들어서 요청한 클라이언트에 (일반적으로 JSON으로) 보낼 수 있습니다.

원래의 쿼리를 마지막으로 살펴보고 이러한 모든 *revoler* 함수가 결과를 어떻게 생성하는지 살펴 보겠습니다.

```graphql
# { "graphiql": true }
{
  human(id: 1002) {
    name
    appearsIn
    starships {
      name
    }
  }
}
```
