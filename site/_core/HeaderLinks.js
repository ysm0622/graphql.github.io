/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

const links = [
  { section: 'learn', text: '배우기', href: '/learn/' },
  { section: 'code', text: '코드', href: '/code/' },
  { section: 'community', text: '커뮤니티', href: '/community/' },
  { section: 'blog', text: '블로그', href: '/blog/' },
  { section: 'spec', text: '명세', href: 'http://facebook.github.io/graphql/' },
];

export default ({ section }) =>
  <nav>
    {links.map(link =>
      <a
        key={link.section}
        href={link.href}
        target={link.href.slice(0, 4) === 'http' ? '_blank' : null}
        rel={link.href.slice(0, 4) === 'http' ? 'noopener noreferrer' : null}
        className={link.section === section ? 'active' : null}>
        {link.text}
      </a>
    )}
  </nav>
