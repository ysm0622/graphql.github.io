---
title: 쿼리 & 뮤테이션
layout: ../_core/DocsLayout
category: Learn
permalink: /learn/queries/
next: /learn/schema/
sublinks: Fields,Arguments,Aliases,Fragments,Operation Name,Variables,Directives,Mutations,Inline Fragments
---

여기서는 GraphQL 서버에 쿼리하는 방법에 대해 자세히 배울 것입니다.

## Fields

GraphQL은 객체에 대한 특정 필드를 요구하는 것이 무척 간단합니다. 아주 간단한 쿼리를 실행할 때 얻는 결과를 살펴 봅시다.

```graphql
# { "graphiql": true }
{
  hero {
    name
  }
}
```

쿼리가 결과와 정확히 동일한 모양을 가지고 있음을 즉시 알 수 있습니다. 이것이 GraphQL의 중요한 점입니다. 항상 기대 한대로 돌아오고, 서버는 클라이언트가 요청하는 필드를 정확히 알고 있기 때문입니다.

`name` 필드는 `String` 타입을 반환합니다. 이 경우 스타워즈의 영웅 이름 인 ``R2-D2 '` 를 반환합니다.

> 팁 - 위의 코드는 *실제로 실행*됩니다. 원하는대로 변경하고 새로운 결과를 볼 수 있습니다. 쿼리의 `hero` 객체에 `appearIn` 필드를 추가하고 새로운 결과를 확인해보세요.

앞의 예제에서 String타입인 영웅의 이름만 요청했지만 필드는 객체를 참조 할 수도 있습니다. 이 경우 해당 객체에 대한 필드의 *하위 선택*을 할 수 있습니다. GraphQL 쿼리는 관련 오브젝트와 필드를 탐색 할 수 있으므로 클라이언트는 고전적인 REST 아키텍처에서 필요한 여러 요청을 수행하는 대신 하나의 요청으로 많은 관련 데이터를 가져올 수 있습니다.

```graphql
# { "graphiql": true }
{
  hero {
    name
    # 쿼리에 주석을 쓸 수 있습니다!
    friends {
      name
    }
  }
}
```

이 예제에서, `friends` 필드는 아이템의 배열을 반환합니다. GraphQL 쿼리는 단일 항목 또는 항목 목록 모두에 대해 동일해 보이지만 스키마에 표시된 항목을 기반으로 예상되는 항목을 알 수 있습니다.

## Arguments

객체와 필드를 탐색하는 것만으로도 GraphQL은 이미 데이터를 가져오는 데 매우 유용한 언어가 될 것입니다. 하지만 필드에 인수를 전달하는 기능을 추가하면 훨씬 재미있는 일을 할 수 있습니다.

```graphql
# { "graphiql": true }
{
  human(id: "1000") {
    name
    height
  }
}
```

REST와 같은 시스템에서는 요청에 쿼리 매개변수와 URL 세그먼트라는 단일 인수 집합만 전달할 수 있습니다. 그러나 GraphQL에서는 모든 필드와 중첩된 객체가 고유한 인수 세트를 가질 수 있으므로 GraphQL을 여러 API를 가져 오기를 위한 완벽한 대체 도구로 사용할 수 있습니다. 스칼라 필드에 인수를 전달하여 모든 클라이언트에서 개별적으로 수행하는 대신 서버에서 데이터 변환을 한 번만 구현할 수도 있습니다.

```graphql
# { "graphiql": true }
{
  human(id: "1000") {
    name
    height(unit: FOOT)
  }
}
```

인수는 여러가지 타입이 될 수 있습니다. 위의 예제에서는 열거형 타입을 사용했습니다. 이 타입은 유한한 옵션 세트 (이 경우에는 길이 단위로 'METER` 또는 `FOOT`) 중 하나를 나타냅니다. GraphQL은 기본 타입과 함께 제공되지만, GraphQL 서버는 전송 형식으로 직렬화 할 수 있는 한 자체 사용자 정의 타입을 선언 할 수도 있습니다.

[GraphQL 타입 시스템에 대한 자세한 정보는 여기를 살펴보세요.](/learn/schema)


## Aliases

눈썰미가 좋으신 분들은 알아차리셨겠지만, 결과 객체 필드가 ​​쿼리의 필드 이름과 일치하지만 인수는 포함하지 않으므로 다른 인수를 사용하여 같은 필드를 직접 쿼리 할 수는 없습니다. 그렇기 때문에 필드의 결과를 원하는 이름으로 바꿀 수 있습니다. 이 것이 *별칭*이 필요한 이유입니다.

```graphql
# { "graphiql": true }
{
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}
```

위의 예제에서 두 `hero` 필드는 서로 충돌하지만, 서로 다른 이름의 별칭을 지정할 수 있으므로 한 요청에서 두 결과를 모두 얻을 수 있습니다.

## Fragments

앱에서 상대적으로 복잡한 페이지가 있다고 가정해 봅시다. 친구를 가진 두 영웅을 순서대로 요청한다고 해봅시다. 그러면 쿼리가 복잡해질 수 있습니다. 이렇게되면 필드를 적어도 두 번 반복해야합니다. 비교의 각면에 대해 한번씩 반복해야하기 때문입니다.

이것이 GraphQL에 *프래그먼트*라는 재사용 가능한 유닛이 포함된 이유입니다. 프래그먼트를 사용하면 필드 세트를 구성한 다음 필요한 곳에 쿼리에 포함시킬 수 있습니다. 다음은 프래그먼트을 사용하여 위의 상황을 해결할 수 있는 방법의 예제입니다.

```graphql
# { "graphiql": true }
{
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

fragment comparisonFields on Character {
  name
  appearsIn
  friends {
    name
  }
}
```

필드가 반복될 경우 위 쿼리가 꽤 반복될 것을 알 수 있습니다. 프래그먼트의 개념은 복잡한 응용 프로그램 데이터 요구 사항을 작은 청크으로 분할하는 데 자주 사용됩니다. 특히 청크가 다른 많은 UI 구성 요소를 하나의 초기 데이터 가져 오기로 결합해야하는 경우에 많이 사용됩니다.

## Operation name

지금까지는 `query` 키워드와 질의 이름을 모두 생략 한 단축 구문을 사용했지만, 프로덕션 애플리케이션에서는 코드를 덜 모호하게 만드는 것이 좋습니다. 쿼리가 아닌 다른 것을 실행하거나 동적 변수를 전달하려는 경우 GraphQL 연산에 이러한 선택적 부분이 필요합니다.

다음은 `query` 키워드를 *operation type* 및 `HeroNameAndFriends` 키워드를 *operation name*으로한 예제입니다.

```graphql
# { "graphiql": true }
query HeroNameAndFriends {
  hero {
    name
    friends {
      name
    }
  }
}
```

*operation type* 은 *query* , *mutation* 또는 *subscription* 이며 수행 할 작업 타입을 설명합니다.

*operation name* 은 작업에 의미 있고 명시적인 이름입니다. 디버깅 및 서버 측 로깅하는데에 매우 유용 할 수 있습니다. 네트워크 로그 나 GraphQL 서버에서 문제가 발생하면 내용을 해독하는 대신 이름으로 코드에서 쿼리를 찾아내는 것이 더 쉽습니다.

좋아하는 프로그래밍 언어의 함수 이름처럼 생각해보세요.

예를 들어, JavaScript에서는 익명 함수를 사용하여 쉽게 작업 할 수 있지만 함수에 이름을 지정하면 코드를 디버그하고 호출 할 때 로깅하는 것이 더 쉽습니다. 같은 방식으로, GraphQL 쿼리 및 뮤테이션 이름과 프래그먼트 이름은 서버 측에서 유용한 Graph 요청을 식별하는 데 유용한 디버깅 도구가 될 수 있습니다.

## Variables

지금까지 우리는 모든 인수를 쿼리 문자열 안에 작성했습니다. 그러나 대부분의 응용 프로그램에서 필드에 대한 인수는 동적일 수 있습니다. 예를 들어 어떤 Star Wars에 관심이 있는지에 선택할 수 있는 드롭다운, 검색필드, 필터 등이 있을 수 있습니다.

클라이언트 측 코드는 쿼리 문자열을 런타임에 동적으로 조작하고 이를 GraphQL의 특정 형태으로 직렬화해야하기 때문에 이러한 동적 인수를 쿼리 문자열에 직접 전달하는 것은 좋은 방법이 아닙니다. 대신 GraphQL은 동적 값을 쿼리에서 제외시키고 이를 별도의 사전으로 전달하는 굉장한 방법을 제공합니다. 이러한 값을 *변수*라고 합니다.

변수를 사용하기 위해서는 다음 세 가지 작업을 해야 합니다.

1. 쿼리의 정적 값을 `$variableName` 으로 변경합니다.
2. `$variableName` 을 쿼리에서 수용하는 변수 중 하나로 선언하십시오.
3. 별도의 transport-specific(일반적으로 JSON) 변수 사전에 `variableName : value` 을 전달하세요.

이러한 형태를 띄게됩니다.

```graphql
# { "graphiql": true, "variables": { "episode": "JEDI" } }
query HeroNameAndFriends($episode: Episode) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

이제 클라이언트 코드에서 완전히 새로운 쿼리를 작성하지 않고 간단하게 다른 변수를 전달할 수 있습니다. 이것은 일반적으로 쿼리의 어떤 인수가 동적 일 것으로 예상되는지를 나타내는 좋은 방법이기도합니다. 사용자가 제공 한 값으로 쿼리를 작성하기 위해 문자열 보간을 사용해서는 안됩니다.

### Variable definitions

변수 정의는 위의 쿼리에서 `( episode : Episode)` 부분입니다. 정적타입 언어의 함수에 대한 인수 정의와 동일하게 작동합니다. `$`접두사가 붙은 모든 변수를 나열하고 그 뒤에 타입(이 경우에는 `Episode`)이 옵니다.

선언 된 모든 변수는 스칼라, 열거형 또는 입력 객체 타입이어야합니다. 복잡한 객체를 필드에 전달하려면 서버에서 일치하는 입력 타입을 알아야합니다. 스키마 페이지에서 입력 객체 타입에 대해 자세히 알아보세요.

변수 정의는 선택적이거나 필수일 수 있습니다. 위의 경우 `Episode` 타입 옆에 `!` 가 없으므로 선택 사항입니다. 그러나 변수를 전달할 필드에 Null이 아닌 인수가 요구된다면 변수가 필요하게 됩니다.

이러한 변수 정의 구문에 대한 자세한 내용을 보려면 GraphQL 스키마 언어를 익히는 것이 좋습니다. 스키마 언어는 스키마 페이지에서 자세히 설명합니다.

### Default variables

타입 선언 다음에 기본값을 추가하여 쿼리의 변수에 기본값을 할당 할 수도 있습니다.

```graphql
query HeroNameAndFriends($episode: Episode = "JEDI") {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

모든 변수에 기본값이 제공되면 변수를 전달하지 않고 쿼리를 호출 할 수 있습니다. 변수 사전의 일부로 전달되는 변수는 기본값을 오버라이드합니다.

## Directives

위에서는 변수를 사용하여 동적 문자열을 생성하는 수동 문자열 보간 작업을 피할 수있는 방법에 대해 알아보았습니다. 인수에 변수를 전달하면 이러한 문제를 상당히 해결할 수 있지만 변수를 사용하여 쿼리의 구조와 모양을 동적으로 변경하는 방법이 필요할 수도 있습니다. 예를 들어 요약보기와 상세보기가 있는 UI 구성 요소를 상상해보세요. 이것은 다른 예제보다 많은 필드가 포함되어 있습니다.

이러한 구성 요소에 대한 쿼리를 작성해 보겠습니다.

```graphql
# { "graphiql": true, "variables": { "episode": "JEDI", "withFriends": false } }
query Hero($episode: Episode, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    friends @include(if: $withFriends) {
      name
    }
  }
}
```

위 변수를 수정하여 `withFriends` 에 `true` 를 전달하고 결과가 어떻게 변하는지 확인해보세요.

*directive*라는 GraphQL의 새로운 기능을 사용해야 합니다. 지시문은 필드 또는 프래그먼트 안에 삽입 될 수 있으며 서버가 원하는 방식으로 쿼리 실행에 영향을 줄 수 있습니다. 핵심 GraphQL 사양에는 정확히 두 가지 지시문이 포함되어 있으며, 이는 사양 호환 GraphQL 서버 구현에서 지원해야합니다.

- `@include(if: Boolean)`: 인수가 `true` 인 경우에만 이 필드를 결과에 포함합니다.
- `@skip(if: Boolean)` 인수가 `true` 이면 이 필드를 건너 뜁니다.

지시문은 쿼리의 필드를 추가하고 제거하기 위해 문자열 조작을 해야하는 상황에서 빠져 나오는데 유용할 수 있습니다. 서버 구현은 완전히 새로운 지시문을 정의하여 실험적인 기능을 추가 할 수도 있습니다.

## Mutations

지금까지 GraphQL에 대한 대부분의 이야기는 데이터 가져오기에 초점을 맞추었습니다. 그러나 완전한 데이터 플랫폼은 서버 측 데이터도 수정할 수 있어야합니다.

REST에서는 모든 요청이 서버에 몇 가지 사이드이펙트을 일으킬 수 있지만 관습에 따라 데이터 수정을 위해 `GET` 요청을 사용하지 않는 것이 좋습니다. GraphQL도 마찬가지입니다. 기술적으로 모든 쿼리를 구현하여 데이터를 기록 할 수 있습니다. 그러나 쓰기를 발생시키는 조작이 명시적으로 뮤테이션를 통해 전송되어야 한다는 규칙을 설정하는 것이 유용합니다.

쿼리와 마찬가지로 뮤테이션 필드가 객체 타입을 반환하면 중첩 필드를 요청할 수 있습니다. 이는 변경된 객체의 새로운 상태를 가져 오는 데에 유용합니다. 간단한 뮤테이션 예제를 살펴 보겠습니다.

```graphql
# { "graphiql": true, "variables": { "ep": "JEDI", "review": { "stars": 5, "commentary": "This is a great movie!" } } }
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

`createReview` 필드가 새로 생성된 리뷰의 `stars` 와 `commentary` 필드를 반환하는 방법에 유의하세요. 이는 하나의 요청으로 필드의 새 값을 변경하고 쿼리 할 수 ​​있기 때문에 기존 데이터를 변경하는 경우(예: 필드를 증가시킬 때) 특히 유용합니다.

이 예제에서 전달한 `review` 변수는 스칼라가 아니라는 것을 알 수 있습니다. 인수로 전달 될 수 있는 특별한 종류의 객체 타입인 *입력 객체 타입*입니다. 스키마 페이지의 입력 타입에 대해 자세히 알아보세요.

### Multiple fields in mutations

뮤테이션은 쿼리와 마찬가지로 여러 필드를 포함 할 수 있습니다. 이름 외에도 쿼리와 뮤테이션 사이에 중요한 차이점이 있습니다.

**쿼리 필드는 병렬로 실행되지만 뮤테이션 필드는 하나씩 차례대로 실행됩니다.**

즉, 하나의 요청에서 두 개의 `incrementCredits` 뮤테이션를 보내면 첫 번째는 두 번째 요청 전에 완료되는 것이 보장됩니다.

## Inline Fragments

여러가지 다른 타입 시스템과 마찬가지로 GraphQL 스키마에는 인터페이스와 유니언 타입을 정의하는 기능이 포함되어 있습니다. [스키마 가이드에서 대해 자세히 알아보세요.](/learn/schema/#interfaces)

인터페이스 또는 유니언 타입을 반환하는 필드를 쿼리하는 경우 특정한 타입의 데이터에 액세스하려면 *인라인 프래그먼트*을 사용해야합니다. 예제를 통해 확인하는 것이 가장 쉽습니다.

```graphql
# { "graphiql": true, "variables": { "ep": "JEDI" } }
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
```

이 쿼리에서 `hero` 필드는 `Character` 를 반환하는데, `episode` 인수에 따라 `Human` 또는 `Droid` 중 하나일 수 있습니다. 직접 선택에서는 `name` 과 같이 `Character` 인터페이스에 있는 필드만 요청할 수 있습니다.

특정한 타입의 필드를 요청하려면 타입 조건이있는 *인라인 프래그먼트*을 사용해야합니다. 첫 번째 프래그먼트는 `... on Droid` 라는 라벨이 붙어 있기 때문에 `primaryFunction` 필드는 `hero` 에서 반환된 `Character` 가 `Droid` 타입 인 경우에만 실행됩니다. `Human` 타입의 `height` 필드도 마찬가지입니다.

이름이 정의된 프래그먼트는 항상 동일한 타입으로 사용될 수 있으므로 항상같 은 방식으로 사용할 수 있습니다.


### Meta fields

GraphQL 서비스에서 리턴될 타입을 모르는 상황이 발생하면 클라이언트에서 해당 데이터를 처리하는 방법을 결정할 방법이 필요합니다. GraphQL을 사용하면 쿼리의 어느 지점에서나 메타 필드 인 `__typename` 을 요청하여 그 시점에서 객체 타입의 이름을 얻을 수 있습니다.

```graphql
# { "graphiql": true}
{
  search(text: "an") {
    __typename
    ... on Human {
      name
    }
    ... on Droid {
      name
    }
    ... on Starship {
      name
    }
  }
}
```

위 쿼리에서 `search` 는 3 가지 옵션 중 하나가 될 수 있는 유니언 타입을 반환합니다. `__typename` 필드가 없으면 클라이언트가 다른 타입을 구별하는 것은 불가능합니다.

GraphQL 서비스는 몇 가지 메타 필드를 제공하며 나머지는 [Introspection](../Introspection/) 시스템을 노출하는 데 사용됩니다.
