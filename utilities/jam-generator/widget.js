(function () {
  'use strict';

  // Amalgam Improv Jam Generator Squarespace widget loader.
  // The GitHub-hosted source below is the ground truth for the embedded widget.
  var rootId = 'amalgam-jam-generator';
  var currentScript = document.currentScript;
  var existingWidget = document.getElementById(rootId);

  if (existingWidget && existingWidget.children.length > 0) {
    return;
  }

  var template = document.createElement('template');
  template.innerHTML = $escapedHtml;

  var fragment = template.content.cloneNode(true);
  var scripts = Array.prototype.slice.call(fragment.querySelectorAll('script'));
  scripts.forEach(function (script) {
    script.parentNode.removeChild(script);
  });

  var mountSelector = currentScript ? currentScript.getAttribute('data-mount') : '';
  var mount = mountSelector ? document.querySelector(mountSelector) : null;

  if (mount) {
    mount.innerHTML = '';
    mount.appendChild(fragment);
  } else if (existingWidget && existingWidget.children.length === 0) {
    existingWidget.replaceWith(fragment);
  } else if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.insertBefore(fragment, currentScript);
  } else {
    document.body.appendChild(fragment);
  }

  scripts.forEach(function (oldScript) {
    var newScript = document.createElement('script');
    Array.prototype.slice.call(oldScript.attributes).forEach(function (attribute) {
      newScript.setAttribute(attribute.name, attribute.value);
    });
    newScript.text = oldScript.textContent;
    document.body.appendChild(newScript);
  });
}());