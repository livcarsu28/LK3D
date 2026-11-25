---
layout: null
permalink: /studio.js
---
{% assign assets = '/dist/assets/' | relative_url %}
{% for file in site.static_files %}
{% if file.path contains '/dist/assets/index-' and file.extname == '.js' %}
{% assign bundle = file.path | remove_first: '/' %}
{% capture compiled %}{% include_relative {{ bundle }} %}{% endcapture %}
{{ compiled | replace: '/assets/', assets }}
{% endif %}
{% endfor %}
