---
layout: null
permalink: /config.js
---
{% assign assets = '/dist/assets/' | relative_url %}
{% capture config %}{% include_relative dist/config.js %}{% endcapture %}
{{ config | replace: '/assets/', assets }}
