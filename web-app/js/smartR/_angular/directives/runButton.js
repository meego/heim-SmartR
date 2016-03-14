//# sourceURL=runButton.js

'use strict';

window.smartRApp.directive('runButton',
    ['$rootScope', 'rServeService', 'processService', function($rootScope, rServeService, processService) {
        return {
            restrict: 'E',
            scope: {
                disabled: '=',
                storage: '=storeResultsIn',
                script: '@scriptToRun',
                name: '@buttonName',
                serialized: '=',
                arguments: '=argumentsToUse'
            },
            templateUrl: $rootScope.smartRPath +  '/js/smartR/_angular/templates/runButton.html',
            link: function(scope, element) {

                var template_btn = element.children()[0],
                    template_msg = element.children()[1],
                    serialized = scope.serialized;

                template_btn.disabled = scope.disabled;
                processService.registerButton(scope, 'runButton');

                scope.$watch('disabled', function (newValue) {
                    template_btn.disabled = newValue;
                }, true);


                var _successCreatePlot = function (response) {
                    template_msg.innerHTML = ''; // empty template
                    if (serialized) { // when results are serialized, we need to deserialized them by
                        // downloading the results files.
                        rServeService.downloadJsonFile(response.executionId, 'heatmap.json').then(
                            function (d) {
                                scope.storage = d.data;
                            }
                        );
                    } else { // results
                        scope.storage = JSON.parse(response.result.artifacts.value);
                    }
                };

                var _failCreatePlot = function (response) {
                    template_msg.style.color = 'red';
                    template_msg.innerHTML = 'Failure: ' + response.statusText;
                };

                var _finishedRunning =  function() {
                    template_btn.disabled = false;
                    processService.onRunning(false);
                };

                template_btn.onclick = function() {

                    scope.storage = {};
                    template_btn.disabled = true;
                    template_msg.innerHTML = 'Creating plot, please wait <span class="blink_me">_</span>';
                    processService.onRunning(true);

                    rServeService.startScriptExecution({
                        taskType: scope.script,
                        arguments: scope.arguments
                    }).then(
                        _successCreatePlot,
                        _failCreatePlot
                    ).finally(
                        _finishedRunning
                    );
                };
            }
        };
    }]);
