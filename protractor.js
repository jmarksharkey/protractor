var util = require('util');
var webdriver = require('selenium-webdriver');

var DEFER_LABEL = 'NG_DEFER_BOOTSTRAP!';

/**
 * All scripts to be run on the client via executeAsyncScript or
 * executeScript should be put here. These scripts are transmitted over
 * the wire using their toString representation, and cannot reference
 * external variables. They can, however use the array passed in to
 * arguments. Instead of params, all functions on clientSideScripts
 * should list the arguments array they expect.
 */
var clientSideScripts = {};

/**
 * Wait until Angular has finished rendering and has
 * no outstanding $http calls before continuing.
 *
 * arguments none.
 */
clientSideScripts.waitForAngular = function() {
  var callback = arguments[arguments.length - 1];
  angular.element(document.body).injector().get('$browser').
      notifyWhenNoOutstandingRequests(callback);
};

/**
 * Find an element in the page by their angular binding.
 *
 * arguments[0] {string} The binding, e.g. {{cat.name}}.
 *
 * @return {WebElement} The element containing the binding.
 */
clientSideScripts.findBinding = function() {
  var bindings = document.getElementsByClassName('ng-binding');
  var matches = [];
  var binding = arguments[0];
  for (var i = 0; i < bindings.length; ++i) {
    var bindingName = angular.element(bindings[i]).data().$binding[0].exp ||
        angular.element(bindings[i]).data().$binding;
    if (bindingName.indexOf(binding) != -1) {
      matches.push(bindings[i]);
    }
  }
  return matches[0]; // We can only return one with webdriver.findElement.
};

/**
 * Find a list of elements in the page by their angular binding.
 *
 * arguments[0] {string} The binding, e.g. {{cat.name}}.
 *
 * @return {Array.<WebElement>} The elements containing the binding.
 */
clientSideScripts.findBindings = function() {
  var bindings = document.getElementsByClassName('ng-binding');
  var matches = [];
  var binding = arguments[0];
  for (var i = 0; i < bindings.length; ++i) {
    var bindingName = angular.element(bindings[i]).data().$binding[0].exp ||
        angular.element(bindings[i]).data().$binding;
    if (bindingName.indexOf(binding) != -1) {
      matches.push(bindings[i]);
    }
  }
  return matches; // Return the whole array for webdriver.findElements.
};

/**
 * Find a row within an ng-repeat.
 *
 * arguments[0] {string} The text of the repeater, e.g. 'cat in cats'.
 * arguments[1] {number} The row index.
 *
 * @return {Element} The row element.
 */
 clientSideScripts.findRepeaterRow = function() {
  var repeater = arguments[0];
  var index = arguments[1];

  var rows = [];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var attr = prefixes[p] + 'repeat';
    var repeatElems = document.querySelectorAll('[' + attr + ']');
    attr = attr.replace(/\\/g, '');
    for (var i = 0; i < repeatElems.length; ++i) {
      if (repeatElems[i].getAttribute(attr).indexOf(repeater) != -1) {
        rows.push(repeatElems[i]);
      }
    }
  }
  return rows[index - 1];
 };

/**
 * Find an element within an ng-repeat by its row and column.
 *
 * arguments[0] {string} The text of the repeater, e.g. 'cat in cats'.
 * arguments[1] {number} The row index.
 * arguments[2] {string} The column binding, e.g. '{{cat.name}}'.
 *
 * @return {Element} The element.
 */
clientSideScripts.findRepeaterElement = function() {
  var matches = [];
  var repeater = arguments[0];
  var index = arguments[1];
  var binding = arguments[2];

  var rows = [];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var attr = prefixes[p] + 'repeat';
    var repeatElems = document.querySelectorAll('[' + attr + ']');
    attr = attr.replace(/\\/g, '');
    for (var i = 0; i < repeatElems.length; ++i) {
      if (repeatElems[i].getAttribute(attr).indexOf(repeater) != -1) {
        rows.push(repeatElems[i]);
      }
    }
  }
  var row = rows[index - 1];
  var bindings = [];
  if (row.className.indexOf('ng-binding') != -1) {
    bindings.push(row);
  }
  var childBindings = row.getElementsByClassName('ng-binding');
  for (var i = 0; i < childBindings.length; ++i) {
    bindings.push(childBindings[i]);
  }
  for (var i = 0; i < bindings.length; ++i) {
    var bindingName = angular.element(bindings[i]).data().$binding[0].exp ||
        angular.element(bindings[i]).data().$binding;
    if (bindingName.indexOf(binding) != -1) {
      matches.push(bindings[i]);
    }
  }
  // We can only return one with webdriver.findElement.
  return matches[0];
};

/**
 * Find the elements in a column of an ng-repeat.
 *
 * arguments[0] {string} The text of the repeater, e.g. 'cat in cats'.
 * arguments[1] {string} The column binding, e.g. '{{cat.name}}'.
 *
 * @return {Array.<Element>} The elements in the column.
 */
clientSideScripts.findRepeaterColumn = function() {
  var matches = [];
  var repeater = arguments[0];
  var binding = arguments[1];

  var rows = [];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var attr = prefixes[p] + 'repeat';
    var repeatElems = document.querySelectorAll('[' + attr + ']');
    attr = attr.replace(/\\/g, '');
    for (var i = 0; i < repeatElems.length; ++i) {
      if (repeatElems[i].getAttribute(attr).indexOf(repeater) != -1) {
        rows.push(repeatElems[i]);
      }
    }
  }
  for (var i = 0; i < rows.length; ++i) {
    var bindings = [];
    if (rows[i].className.indexOf('ng-binding') != -1) {
      bindings.push(rows[i]);
    }
    var childBindings = rows[i].getElementsByClassName('ng-binding');
    for (var k = 0; k < childBindings.length; ++k) {
      bindings.push(childBindings[k]);
    }
    for (var j = 0; j < bindings.length; ++j) {
      var bindingName = angular.element(bindings[j]).data().$binding[0].exp ||
          angular.element(bindings[j]).data().$binding;
      if (bindingName.indexOf(binding) != -1) {
        matches.push(bindings[j]);
      }
    }
  }
  return matches;
};

/**
 * Find an input element by model name.
 *
 * arguments[0] {string} The model name.
 *
 * @return {Element} The first matching input element.
*/
clientSideScripts.findInput = function() {
  var model = arguments[0];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var selector = 'input[' + prefixes[p] + 'model="' + model + '"]';
    var inputs = document.querySelectorAll(selector);
    if (inputs.length) {
      return inputs[0];
    }
  }
};

 /**
  * Find an select element by model name.
  *
  * arguments[0] {string} The model name.
  *
  * @return {Element} The first matching select element.
  */
clientSideScripts.findSelect = function() {
  var model = arguments[0];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var selector = 'select[' + prefixes[p] + 'model="' + model + '"]';
    var inputs = document.querySelectorAll(selector);
    if (inputs.length) {
      return inputs[0];
    }
  }
};

/**
  * Find an selected option element by model name.
  *
  * arguments[0] {string} The model name.
  *
  * @return {Element} The first matching input element.
  */
clientSideScripts.findSelectedOption = function() {
  var model = arguments[0];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var selector =
        'select[' + prefixes[p] + 'model="' + model + '"] option:checked';
    var inputs = document.querySelectorAll(selector);
    if (inputs.length) {
      return inputs[0];
    }
  }
};

/**
 * Tests whether the angular global variable is present on a page. Retries
 * twice in case the page is just loading slowly.
 *
 * arguments none.
 */
 clientSideScripts.testForAngular = function() {
  var callback = arguments[arguments.length - 1];
  var retry = function(n) {
    if (window.angular && window.angular.resumeBootstrap) {
      callback(true);
    } else if (n < 1) {
      callback(false);
    } else {
      window.setTimeout(function() {retry(n - 1)}, 1000);
    }
  };
  if (window.angular && window.angular.resumeBootstrap) {
    callback(true);
  } else {
    retry(3);
  }
};


/**
 * @param {webdriver.WebDriver} webdriver
 * @constructor
 */
var Protractor = function(webdriver) {
  this.driver = webdriver;

  this.moduleNames_ = [];

  this.moduleScripts_ = [];
};

/**
 * Instruct webdriver to wait until Angular has finished rendering and has
 * no outstanding $http calls before continuing.
 *
 * @return {!webdriver.promise.Promise} A promise that will resolve to the
 *    scripts return value.
 */
Protractor.prototype.waitForAngular = function() {
  return this.driver.executeAsyncScript(clientSideScripts.waitForAngular);
};

/**
 * See webdriver.WebDriver.findElement
 *
 * Waits for Angular to finish rendering before searching for elements.
 */
Protractor.prototype.findElement = function(locator, varArgs) {
  this.waitForAngular();
  if (locator.findOverride) {
    return locator.findOverride(this.driver);
  }
  return this.driver.findElement(locator, varArgs);
};

/**
 * See webdriver.WebDriver.findElements
 *
 * Waits for Angular to finish rendering before searching for elements.
 */
Protractor.prototype.findElements = function(locator, varArgs) {
  this.waitForAngular();
  if (locator.findArrayOverride) {
    return locator.findArrayOverride(this.driver);
  }
  return this.driver.findElements(locator, varArgs);
};

/**
 * Add a module to load before Angular whenever Protractor.get is called.
 * Modules will be registered after existing modules already on the page,
 * so any module registered here will override preexisting modules with the same
 * name.
 *
 * @param {!string} name The name of the module to load or override.
 * @param {!string|Function} script The JavaScript to load the module.
 */
Protractor.prototype.addMockModule = function(name, script) {
  this.moduleNames_.push(name);
  this.moduleScripts_.push(script);
};

/**
 * Clear the list of registered mock modules.
 */
Protractor.prototype.clearMockModules = function() {
  this.moduleNames_ = [];
  this.moduleScripts_ = [];
};

/**
 * See webdriver.WebDriver.get
 *
 * Navigate to the given destination and loads mock modules before
 * Angular.
 */
Protractor.prototype.get = function(destination) {
  this.driver.get('about:blank');
  this.driver.executeScript('window.name += "' + DEFER_LABEL + '";' +
      'window.location.href = "' + destination + '"');

  // Make sure the page is an Angular page.
  this.driver.executeAsyncScript(clientSideScripts.testForAngular).
      then(function(hasAngular) {
        if (!hasAngular) {
          throw new Error('Angular could not be found on the page ' +
              destination);
        }
      });

  // At this point, Angular will pause for us, until angular.resumeBootstrap
  // is called.
  for (var i = 0; i < this.moduleScripts_.length; ++i) {
    this.driver.executeScript(this.moduleScripts_[i]);
  }

  this.driver.executeAsyncScript(function() {
    var callback = arguments[arguments.length - 1];
    // Continue to bootstrap Angular.
    angular.resumeBootstrap(arguments[0]);
    callback();
  }, this.moduleNames_);
};

/**
 * Create a new instance of Protractor by wrapping a webdriver instance.
 *
 * @param {webdriver.WebDriver} webdriver The configured webdriver instance.
 */
exports.wrapDriver = function(webdriver) {
  return new Protractor(webdriver);
};


/**
 * Locators.
 */
var ProtractorBy = function() {};
var WebdriverBy = function() {};

/**
 * webdriver's By is an enum of locator functions, so we must set it to
 * a prototype before inheriting from it.
 */
WebdriverBy.prototype = webdriver.By;
util.inherits(ProtractorBy, WebdriverBy);

/**
 * Usage:
 *   <span>{{status}}</span>
 *   var status = ptor.findElement(protractor.By.binding('{{status}}'));
 *
 * Note: This ignores parent element restrictions if called with
 * WebElement.findElement.
 */
ProtractorBy.prototype.binding = function(bindingDescriptor) {
  return {
    findOverride: function(driver) {
      return driver.findElement(webdriver.By.js(clientSideScripts.findBinding),
          bindingDescriptor);
    },
    findArrayOverride: function(driver) {
      return driver.findElements(
          webdriver.By.js(clientSideScripts.findBindings),
          bindingDescriptor);
    }
  };
};

/**
 * Usage:
 * <select ng-model="user" ng-options="user.name for user in users"></select>
 * ptor.findElement(protractor.By.select("user"));
 */
ProtractorBy.prototype.select = function(model) {
  return {
    findOverride: function(driver) {
      return driver.findElement(
        webdriver.By.js(clientSideScripts.findSelect), model);
    }
  };
};

ProtractorBy.prototype.selectedOption = function(model) {
  return {
    findOverride: function(driver) {
      return driver.findElement(
        webdriver.By.js(clientSideScripts.findSelectedOption), model);
    }
  };
};

ProtractorBy.prototype.input = function(model) {
  return {
    findOverride: function(driver) {
      return driver.findElement(
          webdriver.By.js(clientSideScripts.findInput), model);
    }
  };
};

/**
 * Usage:
 * <div ng-repeat = "cat in pets">
 *   <span>{{cat.name}}</span>
 *   <span>{{cat.age}}</span>
 * </div>
 *
 * // Returns the DIV for the second cat.
 * var secondCat = ptor.findElement(
 *     protractor.By.repeater("cat in pets").row(2));
 * // Returns the SPAN for the first cat's name.
 * var firstCatName = ptor.findElement(
 *     protractor.By.repeater("cat in pets").row(1).column("{{cat.name}}"));
 * // Returns an array of WebElements from a column
 * var ages = ptor.findElements(
 *     protractor.By.repeater("cat in pets").column("{{cat.age}}"));
 */
ProtractorBy.prototype.repeater = function(repeatDescriptor) {
  return {
    row: function(index) {
      return {
        findOverride: function(driver) {
          return driver.findElement(
              webdriver.By.js(clientSideScripts.findRepeaterRow),
              repeatDescriptor, index);
        },
        column: function(binding) {
          return {
            findOverride: function(driver) {
              return driver.findElement(
                  webdriver.By.js(clientSideScripts.findRepeaterElement),
                  repeatDescriptor, index, binding);
            }
          };
        }
      };
    },
    column: function(binding) {
      return {
        findArrayOverride: function(driver) {
          return driver.findElements(
              webdriver.By.js(clientSideScripts.findRepeaterColumn),
              repeatDescriptor, binding);
        }
      };
    }
  };
};

exports.By = new ProtractorBy();
