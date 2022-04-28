angular.module("umbraco")
    .controller("seoChecker.configurationissuesController",
    function ($scope, $timeout, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.loaded = false;
        $scope.initializeData = function () {
            seocheckerBackofficeResources.initializeConfigurationIssues().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.bindData = function () {
            seocheckerBackofficeResources.configurationIssues($scope.model).then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.clearDialog = function () {
            var options = {
                localizationKey: "seoCheckerBulkActions_bulkActionClearAllConfirmMessage",
                view: "/app_plugins/seochecker/dialogs/confirm.html",
                size: "small",
                submit: function () {
                    seocheckerBackofficeResources.clearConfigurationIssues().then(function (res) {
                        seocheckerHelper.showNotification(res.data);
                        $scope.bindData();
                    });
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };

        $scope.filter = function () {
            $scope.bindData();
        };

        $scope.sort = function (column) {
            $scope.model.setSortColumn = column;
            $scope.bindData();
        };

        $scope.setRecordCount = function () {
            $scope.model.resetPaging = true;
            $scope.bindData();
        };

        $scope.goToPage = function (pageNumber) {
            $scope.model.paging.currentPage = pageNumber;
            $scope.bindData();
        };

        $scope.showResult = function () {
            return $scope.model.hasRecords || ($scope.model.filter != null && $scope.model.filter.length > 0);
        };

        $scope.handleSelectAll = function () {
            seocheckerHelper.handleSelectAll($scope.model.selectAll, $scope.model.data);
        };

        $scope.anyItemSelected = function () {
            return seocheckerHelper.anyItemSelected($scope.model.data);
        }

        $scope.isSortDirection = function (columnName, sortDirection) {
            return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
        }


        $scope.deleteSelected = function () {
            var options = {
                selectedItems:  seocheckerHelper.getSelectedItems($scope.model.data),
                view: "/app_plugins/seochecker/dialogs/validation/deleteconfigurationissues.html",
                size: "small",
                submit: function () {
                    $scope.model.resetPaging = true;
                    $scope.bindData();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);

        };

        //Initialize
        $scope.initializeData();
    });
angular.module("umbraco")
    .controller("seoChecker.definitionSettingsController",
    function ($scope, $routeParams, notificationsService,editorService,eventsService, seocheckerBackofficeResources, seocheckerHelper) {
        var evts = [];
    	$scope.bindData = function () {
    		seocheckerBackofficeResources.initializeDefinitionSettings($routeParams.id).then(function (res) {
    			$scope.model = res.data;
    			$scope.loaded = true;
    			seocheckerHelper.syncPath($scope.model.path);
		            evts.push(eventsService.on("app.tabChange", function(name, tabAlias) {
		                tabChanged(tabAlias);
		            }));
    		},
            function (data) {
            	seocheckerHelper.showServerError();
            });
    	};

        function tabChanged(tabinfo) {
            var newActiveTab = seocheckerHelper.getTabByName($scope.model.tabs,tabinfo.alias);
            $scope.changeTab(newActiveTab);
        }
      
        $scope.getActiveTab = function()
        {
            if ($scope.loaded === true) {
                var newActiveTab = $scope.model.tabs[0];
                if (angular.isUndefined($scope.model) || angular.isUndefined($scope.model.tabs)) {
                    return {};
                }

                $scope.model.tabs.forEach(function(tab) {
                    if (tab.active === true) {
                        newActiveTab = tab;
                    }
                });
                return newActiveTab;
            }
        };

        $scope.changeTab = function(tab) {
            $scope.model.tabs.forEach(function(tab) {
                tab.active = false;
            });
            tab.active = true;
        };

    	$scope.save = function () {
    		seocheckerBackofficeResources.saveDefinitionSettings($scope.model).then(function (res) {
    		    var model = res.data;
    		    seocheckerHelper.applyValidationErrors(model, $scope.model);
    			if (!model.isInValid) {
    				$scope.frm.$setPristine();
    				seocheckerHelper.showNotification(model.notificationStatus);
    			}
    		},
            function (data) {
            	seocheckerHelper.showServerError();
            });
    	};

    	//Initialize
    	$scope.bindData();

        $scope.$on('$destroy', function () {
            for (var e in evts) {
                eventsService.unsubscribe(evts[e]);
            }
        });
    });
angular.module("umbraco")
    .controller("seoChecker.deleteController",
    function ($scope, seocheckerBackofficeResources, treeService, navigationService) {
      
        $scope.performDelete = function () {

            //mark it for deletion (used in the UI)
            $scope.currentNode.loading = true;

            treeService.removeNode($scope.currentNode);

            seocheckerBackofficeResources.deleteTreeNodeById($scope.currentNode.id).then(function () {
                $scope.currentNode.loading = false;

                navigationService.hideMenu();
            });

        };

        $scope.cancel = function () {
            navigationService.hideDialog();
        };
    });


angular.module("umbraco")
    .controller("seoChecker.domainSettingsController",
    function ($scope, $routeParams, notificationsService, editorService,eventsService, seocheckerBackofficeResources, seocheckerHelper) {
        var evts = [];

        $scope.bindData = function () {

            seocheckerBackofficeResources.initializeDomainSettings($routeParams.id).then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
                seocheckerHelper.syncPath($scope.model.path);
                    evts.push(eventsService.on("app.tabChange", function(name, tabAlias) {
                        tabChanged(tabAlias);
                    }));
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        function tabChanged(tabinfo) {
            var newActiveTab = seocheckerHelper.getTabByName($scope.model.tabs,tabinfo.alias);
            $scope.changeTab(newActiveTab);
        };
      
        $scope.getActiveTab = function()
        {
            if ($scope.loaded === true) {
                var newActiveTab = $scope.model.tabs[0];
                if (angular.isUndefined($scope.model) || angular.isUndefined($scope.model.tabs)) {
                    return {};
                }

                $scope.model.tabs.forEach(function(tab) {
                    if (tab.active === true) {
                        newActiveTab = tab;
                    }
                });
                return newActiveTab;
            }
        };

        $scope.save = function () {
            seocheckerBackofficeResources.saveDomainSettings($scope.model).then(function (res) {
                var model = res.data;
                if (!model.isInValid) {
                    $scope.frm.$setPristine();
                    seocheckerHelper.showNotification(model.notificationStatus);
                }
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        $scope.changeTab = function(tab) {
            $scope.model.tabs.forEach(function(tab) {
                tab.active = false;
            });
            tab.active = true;
        };

        //Initialize
        $scope.bindData();

        $scope.$on('$destroy', function () {
            for (var e in evts) {
                eventsService.unsubscribe(evts[e]);
            }
        });
    });
angular.module("umbraco")
    .controller("seoChecker.emailSettingsController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.bindData = function () {

            seocheckerBackofficeResources.initializeEmailSettings($routeParams.id).then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
                seocheckerHelper.syncPath($scope.model.path);
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        $scope.save = function () {
            seocheckerBackofficeResources.saveEmailSettings($scope.model).then(function (res) {
                $scope.model = res.data;
                if (!$scope.model.isInValid) {
                    seocheckerHelper.showNotification($scope.model.notificationStatus);
                    $scope.frm.$setPristine();
                }
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("seoChecker.generalSettingsController",
        function ($scope, $rootScope, $routeParams, notificationsService, editorService, eventsService, seocheckerBackofficeResources, seocheckerHelper) {
            var evts = [];

            $scope.initialize = function () {

                seocheckerBackofficeResources.initializeGeneralSettingsModel().then(function (res) {
                    $scope.bindModelData(res.data);
                },
                    function (data) {
                        seocheckerHelper.showServerError();
                    });
            };

            $scope.bindData = function () {

                seocheckerBackofficeResources.initializeGeneralSettings($scope.model).then(function (res) {
                    $scope.bindModelData(res.data);
                },
                    function (data) {
                        seocheckerHelper.showServerError();
                    });
            };
            $rootScope.$on("seobooleanCheckbox.changed", function (event, data) {


                if (data.alias === 'enableUrlRewriting') {
                    $scope.updateTabModel('rewriteTab');
                }

                if (data.alias === 'enableRedirectmodule') {
                    $scope.updateTabModel('redirectTab');
                }

                if (data.alias === 'useFaceBook') {
                    $scope.updateTabModel('socialTab');
                }
                if (data.alias === 'useTwitter') {
                    $scope.updateTabModel('socialTab');
                }
                if (data.alias === 'robotsTxtEnabled') {
                    $scope.updateTabModel('robotsTxt');
                }
                if (data.alias === 'xmlSitemapEnabled') {
                    $scope.updateTabModel('xmlSitemapTab');
                }
            });

            $scope.bindModelData = function (model) {
                $scope.model = model;
                $scope.loaded = true;
                seocheckerHelper.syncPath($scope.model.path);
                seocheckerHelper.syncPath($scope.model.path);
                evts.push(eventsService.on("app.tabChange", function (name, tabAlias) {
                    tabChanged(tabAlias);
                }));
            }

            function tabChanged(tabinfo) {
                var newActiveTab = seocheckerHelper.getTabByName($scope.model.tabs, tabinfo.alias);
                $scope.changeTab(newActiveTab);
            };

            $scope.getActiveTab = function () {
                if ($scope.loaded === true) {
                    var newActiveTab = $scope.model.tabs[0];
                    if (angular.isUndefined($scope.model) || angular.isUndefined($scope.model.tabs)) {
                        return {};
                    }

                    $scope.model.tabs.forEach(function (tab) {
                        if (tab.active === true) {
                            newActiveTab = tab;
                        }
                    });
                    return newActiveTab;
                }
            };
            $scope.changeTab = function (tab) {
                $scope.model.tabs.forEach(function (tab) {
                    tab.active = false;
                });
                tab.active = true;
            };


            $scope.updateTabModel = function (tabName) {
                seocheckerBackofficeResources.initializeGeneralSettings($scope.model)
                    .then(function (res) {
                        seocheckerHelper.updateTab($scope.model, res.data, tabName);
                    },
                        function (data) {
                            seocheckerHelper.showServerError();
                        });
            }

            $scope.save = function () {
                seocheckerBackofficeResources.saveGeneralSettings($scope.model).then(function (res) {
                    var model = res.data;
                    if (!model.isInValid) {
                        $scope.frm.$setPristine();
                        seocheckerHelper.showNotification(model.notificationStatus);
                    }
                },
                    function (data) {
                        seocheckerHelper.showServerError();
                    });
            };

            //Initialize
            $scope.initialize();

            $scope.$on('$destroy', function () {
                for (var e in evts) {
                    eventsService.unsubscribe(evts[e]);
                }
            });
        });
angular.module("umbraco")
    .controller("seoChecker.ignoredConfigurationController",
    function ($scope, $timeout, $routeParams, notificationsService, localizationService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.loaded = false;

        $scope.initialize = function () {
            seocheckerBackofficeResources.initializeignoredConfigurationIssues().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.bindData = function () {
            seocheckerBackofficeResources.ignoredConfigurationIssues($scope.model).then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.filter = function () {
            $scope.bindData();
        };

        $scope.sort = function (column) {
            $scope.model.setSortColumn = column;
            $scope.bindData();
        };

        $scope.setRecordCount = function () {
            $scope.model.resetPaging = true;
            $scope.bindData();
        };

        $scope.goToPage = function (pageNumber) {
            $scope.model.paging.currentPage = pageNumber;
            $scope.bindData();
        };

        $scope.showResult = function () {
            return $scope.model.hasRecords || ($scope.model.filter != null && $scope.model.filter.length > 0);
        };

        $scope.handleSelectAll = function () {
            seocheckerHelper.handleSelectAll($scope.model.selectAll, $scope.model.data);
        };

        $scope.anyItemSelected = function () {
            return seocheckerHelper.anyItemSelected($scope.model.data);
        }

        $scope.isSortDirection = function (columnName, sortDirection) {
            return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
        }


        $scope.deleteSelected = function () {
            var options = {
                localizationKey: "seoCheckerBulkActions_bulkActionDeleteConfirmMessage",
                view: "/app_plugins/seochecker/dialogs/confirm.html",
                size: "small",
                submit: function () {
                    var data = seocheckerHelper.getSelectedItems($scope.model.data);
                    seocheckerBackofficeResources.removeIgnoredConfigurationIssues(data).then(function (res) {
                        seocheckerHelper.showNotification(res.data);
                        $scope.bindData();
                    });
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };

        //Initialize
        $scope.initialize();
    });
angular.module("umbraco")
    .controller("seoChecker.ignoredInboundlinkissuesController",
    function ($scope, $timeout, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.loaded = false;

        $scope.initialize = function () {
            seocheckerBackofficeResources.initializeIgnoredInBoundLinkErrors().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.bindData = function () {
            seocheckerBackofficeResources.loadAllIgnoredInBoundLinkErrors($scope.model).then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.filter = function () {
            $scope.bindData();
        };

        $scope.sort = function (column) {
            $scope.model.setSortColumn = column;
            $scope.bindData();
        };

        $scope.setRecordCount = function () {
            $scope.model.resetPaging = true;
            $scope.bindData();
        };

        $scope.goToPage = function (pageNumber) {
            $scope.model.paging.currentPage = pageNumber;
            $scope.bindData();
        };

        $scope.showResult = function () {
            return $scope.model.hasRecords ||  ($scope.model.filter!= null && $scope.model.filter.length > 0);
        };

        $scope.handleSelectAll = function () {
            seocheckerHelper.handleSelectAll($scope.model.selectAll, $scope.model.data);
        };

        $scope.anyItemSelected = function () {
            return seocheckerHelper.anyItemSelected($scope.model.data);
        }

        $scope.isSortDirection = function (columnName, sortDirection) {
            return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
        }


        $scope.deleteSelected = function () {
            var options = {
                localizationKey: "seoCheckerBulkActions_bulkActionDeleteConfirmMessage",
                view: "/app_plugins/seochecker/dialogs/confirm.html",
                size: "small",
                submit: function () {
                    var data = seocheckerHelper.getSelectedItems($scope.model.data);
                    seocheckerBackofficeResources.removeIgnoredInboundLinkIssues(data).then(function (res) {
                        seocheckerHelper.showNotification(res.data);
                        $scope.bindData();
                    });
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };
        
        //Initialize
        $scope.initialize();
    });
angular.module("umbraco")
    .controller("seoChecker.ignoredValidationqueueController",
    function ($scope, $timeout, $routeParams, notificationsService,localizationService,  editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.loaded = false;

        $scope.initialize = function () {
            seocheckerBackofficeResources.initializeIgnoredValidationIssues().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.bindData = function () {
            seocheckerBackofficeResources.ignoredValidationIssues($scope.model).then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.filter = function () {
            $scope.bindData();
        };

        $scope.sort = function (column) {
            $scope.model.setSortColumn = column;
            $scope.bindData();
        };

        $scope.setRecordCount = function () {
            $scope.model.resetPaging = true;
            $scope.bindData();
        };

        $scope.goToPage = function (pageNumber) {
            $scope.model.paging.currentPage = pageNumber;
            $scope.bindData();
        };

        $scope.showResult = function () {
            return $scope.model.hasRecords ||($scope.model.filter != null && $scope.model.filter.length > 0);
        };

        $scope.handleSelectAll = function () {
            seocheckerHelper.handleSelectAll($scope.model.selectAll, $scope.model.data);
        };

        $scope.anyItemSelected = function () {
            return seocheckerHelper.anyItemSelected($scope.model.data);
        }

        $scope.isSortDirection = function (columnName, sortDirection) {
            return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
        }


        $scope.deleteSelected = function () {
            var options = {
                localizationKey: "seoCheckerBulkActions_bulkActionDeleteConfirmMessage",
                view: "/app_plugins/seochecker/dialogs/confirm.html",
                size: "small",
                submit: function () {
                    var data = seocheckerHelper.getSelectedItems($scope.model.data);
                    seocheckerBackofficeResources.removeIgnoredValidationIssues(data).then(function (res) {
                        seocheckerHelper.showNotification(res.data);
                        $scope.bindData();
                    });
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };

        //Initialize
        $scope.initialize();
    });
angular.module("umbraco")
    .controller("seoChecker.inboundlinkissuesController",
    function ($scope, $timeout, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.loaded = false;

        $scope.initialize = function () {
            seocheckerBackofficeResources.initializeInBoundLinkErrors().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };
        $scope.bindData = function () {
            seocheckerBackofficeResources.loadAllInBoundLinkErrors($scope.model).then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.save = function () {
            seocheckerBackofficeResources.saveInBoundLinkErrors($scope.model.data).then(function (res) {
                $scope.model = res.data;
                seocheckerHelper.showNotification($scope.model.notificationStatus);
            });
        };

        $scope.filter = function () {
            $scope.bindData();
        };

        $scope.sort = function (column) {
            $scope.model.setSortColumn = column;
            $scope.bindData();
        };

        $scope.setRecordCount = function () {
            $scope.model.resetPaging = true;
            $scope.bindData();
        };

        $scope.goToPage = function (pageNumber) {
            $scope.model.paging.currentPage = pageNumber;
            $scope.bindData();
        };

        $scope.showResult = function () {
            return $scope.model.hasRecords || ($scope.model.filter != null && $scope.model.filter.length > 0);
        };

        $scope.handleSelectAll = function () {
            seocheckerHelper.handleSelectAll($scope.model.selectAll, $scope.model.data);
        };

        $scope.anyItemSelected = function () {
            return seocheckerHelper.anyItemSelected($scope.model.data);
        }

        $scope.isSortDirection = function (columnName, sortDirection) {
            return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
        }
        $scope.deleteSelected = function () {
            var options = {
                selectedItems: seocheckerHelper.getSelectedItems($scope.model.data),
                view: "/app_plugins/seochecker/dialogs/redirects/deleteredirects.html",
                size: "small",
                submit: function () {
                    $scope.model.resetPaging = true;
                    $scope.bindData();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };

        $scope.editRedirect = function (id) {
            var options = {
                redirectid: id,
                view: "/app_plugins/seochecker/dialogs/redirects/editredirects.html",
                size: "small",
                submit: function () {
                    $scope.model.resetPaging = true;
                    $scope.bindData();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };

       
        $scope.showDialog = function (item) {
            var dialogOptions = {
                multiPicker: false,
                startNodeId: null,
                submit: function (data) {
                    item.id =  data.selection[0].id;
                    item.name =data.selection[0].name;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    editorService.close();
                },
                close: function close() {
                    editorService.close();
                },
                idType: "int"
            };
            if (item.contentType === 'media') {
                editorService.mediaPicker(dialogOptions);

            } else {

                editorService.contentPicker(dialogOptions);
            }

        };

        $scope.clear = function (item) {
            item.id = null;
            item.name = '';
        };

        $scope.buttonGroup = {
            defaultButton: {
                labelKey: "buttons_save",
                hotKey: "ctrl+s",
                hotKeyWhenHidden: false,
                handler: function() {
                    $scope.save();
                }
            },
            subButtons: [
                {
                    labelKey: "seoCheckerBulkActions_bulkActionClearAllButton",
                    hotKey: "ctrl+d",
                    hotKeyWhenHidden: false,
                    handler: function() {
                        var options = {
                            localizationKey: "seoCheckerBulkActions_bulkActionClearAllConfirmMessage",
                            view: "/app_plugins/seochecker/dialogs/confirm.html",
                            size: "small",
                            submit: function () {
                                seocheckerBackofficeResources.clearInboundLinkIssues().then(function (res) {
                                    seocheckerHelper.showNotification(res.data);
                                    $scope.bindData();
                                });
                                editorService.close();
                            },
                            close: function () {
                                editorService.close();
                            }
                        };
                        editorService.open(options);
                    }
                }
            ]
        };

        //Initialize
        $scope.initialize();
    });
angular.module("umbraco")
    .controller("seoChecker.notificationsController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {

        $scope.bindData = function () {

            seocheckerBackofficeResources.initializeNotifications().then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
                seocheckerHelper.syncPath($scope.model.path);
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        $scope.save = function () {
            seocheckerBackofficeResources.saveNotifications($scope.model).then(function (res) {
                $scope.model = res.data;
                if (!res.data.isInValid) {
                    $scope.frm.$setPristine();
                    seocheckerHelper.showNotification($scope.model.notificationStatus);
                }
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("seoChecker.permissionSettingsController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.bindData = function () {

            seocheckerBackofficeResources.initializePermissionSettings().then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
                seocheckerHelper.syncPath($scope.model.path);
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        $scope.save = function () {
            seocheckerBackofficeResources.savePermissionSettings($scope.model).then(function (res) {
                var model = res.data;
                if (!model.isInValid) {
                    $scope.frm.$setPristine();
                    seocheckerHelper.showNotification(model.notificationStatus);
                }
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };

        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("seoChecker.redirectmanagerController",
        function ($scope, $timeout, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
            $scope.loaded = false;

            $scope.initialize = function () {
                seocheckerBackofficeResources.initializeRedirects().then(function (res) {
                    $scope.setData(res.data);
                });
            };

            $scope.bindData = function () {
                seocheckerBackofficeResources.loadAllRedirects($scope.model).then(function (res) {
                    $scope.setData(res.data);
                });
            };
            $scope.setData = function (model) {

                $scope.loaded = true;
                $scope.model = model;
                seocheckerHelper.syncPath($scope.model.path);
            };

            $scope.doExport = function (model) {
                var url = seocheckerBackofficeResources.getRedirectExportUrl(model);
                seocheckerHelper.downloadFile(url);
            }

            $scope.doImport = function (model) {
                seocheckerBackofficeResources.importRedirects(model).then(function (res) {

                });
            }

            $scope.filter = function () {
                $scope.bindData();
            };

            $scope.sort = function (column) {
                $scope.model.setSortColumn = column;
                $scope.bindData();
            };

            $scope.setRecordCount = function () {
                $scope.model.resetPaging = true;
                $scope.bindData();
            };

            $scope.goToPage = function (pageNumber) {
                $scope.model.paging.currentPage = pageNumber;
                $scope.bindData();
            };

            $scope.showResult = function () {
                return $scope.model.hasRecords || ($scope.model.filter != null && $scope.model.filter.length > 0);
            };

            $scope.handleSelectAll = function () {
                seocheckerHelper.handleSelectAll($scope.model.selectAll, $scope.model.data);
            };

            $scope.anyItemSelected = function () {
                return seocheckerHelper.anyItemSelected($scope.model.data);
            }

            $scope.isSortDirection = function (columnName, sortDirection) {
                return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
            }


            $scope.deleteSelected = function () {
                var options = {
                    selectedItems: seocheckerHelper.getSelectedItems($scope.model.data),
                    view: "/app_plugins/seochecker/dialogs/redirects/deleteredirects.html",
                    size: "small",
                    submit: function () {
                        $scope.model.resetPaging = true;
                        $scope.bindData();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.open(options);
            };

            $scope.editRedirect = function (id) {
                var options = {
                    redirectid: id,
                    view: "/app_plugins/seochecker/dialogs/redirects/editredirects.html",
                    size: "small",
                    submit: function () {
                        $scope.model.resetPaging = true;
                        $scope.bindData();
                        editorService.close();
                    },
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.open(options);
            };


            $scope.buttonGroup = {
                defaultButton: {
                    labelKey: "seoCheckerRedirectManager_createButton",
                    hotKey: "ctrl+n",
                    hotKeyWhenHidden: true,
                    handler: function () {
                        $scope.editRedirect('0');
                    }
                },
                subButtons: [
                    {
                        labelKey: "seoCheckerExportRedirects_exportOptionButton",
                        hotKey: "ctrl+e",
                        hotKeyWhenHidden: true,
                        handler: function () {
                            var options = {
                                view: "/app_plugins/seochecker/dialogs/redirects/exportredirects.html",
                                size: "small",
                                submit: function (model) {
                                    if (model != null) {
                                        $scope.doExport(model);
                                    }
                                    editorService.close();
                                },
                                close: function () {
                                    editorService.close();
                                }
                            };
                            editorService.open(options);
                        }
                    },
                    {
                        labelKey: "seoCheckerImportRedirects_importOptionButton",
                        hotKey: "ctrl+i",
                        hotKeyWhenHidden: true,
                        handler: function () {
                            var options = {
                                view: "/app_plugins/seochecker/dialogs/redirects/importredirects.html",
                                size: "small",
                                submit: function () {
                                    $scope.model.resetPaging = true;
                                    $scope.bindData();
                                    editorService.close();
                                },
                                close: function () {
                                    editorService.close();
                                }
                            };
                            editorService.open(options);
                        }
                    }
                ]
            };

            //Initialize
            $scope.initialize();
        });
angular.module("umbraco")
    .controller("seoChecker.validateController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {

        $scope.bindData = function () {

            seocheckerBackofficeResources.initializeValidationForm($routeParams.id).then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
                seocheckerHelper.syncPath($scope.model.path);
                $scope.setTitle();
            });
        };

        $scope.selectRoot = function () {
            editorService.contentPicker({
                startNodeId: -1,
                multiPicker: false,
                callback: function (data) {
                    $scope.model.rootNode.id = data.id;
                    $scope.model.rootNode.name = data.name;
                }
            });
        };

        $scope.validate = function () {
            seocheckerBackofficeResources.validate($scope.model).then(function (res) {
                $scope.model = res.data;
                $scope.setTitle();
                seocheckerHelper.showNotification($scope.model.notificationStatus);
                $scope.frm.$setPristine();
            });
        };

        $scope.save = function () {
            seocheckerBackofficeResources.saveValidation($scope.model).then(function (res) {
                $scope.model = res.data;
                $scope.setTitle();
                if (!$scope.model.isInValid) {
                    seocheckerHelper.syncPath($scope.model.path);
                    seocheckerHelper.showNotification($scope.model.notificationStatus);
                }
                $scope.frm.$setPristine();
            });
        };

        $scope.setTitle = function () {
            $scope.model.displayPageName = $scope.model.scheduledValidation
                ? $scope.model.scheduleValidationPageName
                : $scope.model.pageName;
        };

        $scope.buttonGroup = {
            defaultButton: {
                labelKey: "seoCheckerValidate_validationStart",
                hotKey: "ctrl+s",
                buttonStyle:"primary",
                hotKeyWhenHidden: true,
                handler: function () {
                    $scope.validate();
                }
            },
            subButtons: [
                {
                    labelKey: "seoCheckerValidate_scheduleButton",
                    hotKey: "ctrl+e",
                    hotKeyWhenHidden: true,
                    handler: function () {
                        $scope.model.scheduledValidation = true;
                        $scope.setTitle();
                    }
                }
            ]
        };

        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("seoChecker.validationissuesController",
    function ($scope, $timeout, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.loaded = false;

        $scope.initializeData = function () {
            seocheckerBackofficeResources.initializevalidationIssues().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.bindData = function () {
            seocheckerBackofficeResources.validationIssues($scope.model).then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
        };

        $scope.clearDialog = function () {
            var options = {
                localizationKey: "seoCheckerBulkActions_bulkActionClearAllConfirmMessage",
                view: "/app_plugins/seochecker/dialogs/confirm.html",
                size: "small",
                submit: function () {
                    seocheckerBackofficeResources.clearValidationIssues().then(function (res) {
                        seocheckerHelper.showNotification(res.data);
                        $scope.bindData();
                    });
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };

        $scope.filter = function () {
            $scope.bindData();
        };

        $scope.sort = function (column) {
            $scope.model.setSortColumn = column;
            $scope.bindData();
        };

        $scope.setRecordCount = function () {
            $scope.model.resetPaging = true;
            $scope.bindData();
        };

        $scope.goToPage = function (pageNumber) {
            $scope.model.paging.currentPage = pageNumber;
            $scope.bindData();
        };

        $scope.showResult = function () {
            return $scope.model.hasRecords ||($scope.model.filter != null && $scope.model.filter.length > 0);
        };

        $scope.handleSelectAll = function () {
            seocheckerHelper.handleSelectAll($scope.model.selectAll, $scope.model.data);
        };

        $scope.anyItemSelected = function () {
            return seocheckerHelper.anyItemSelected($scope.model.data);
        }

        $scope.isSortDirection = function (columnName, sortDirection) {
            return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
        }

        $scope.deleteSelected = function () {
            var options = {
                selectedItems:  seocheckerHelper.getSelectedItems($scope.model.data),
                view: "/app_plugins/seochecker/dialogs/validation/deletevalidationissues.html",
                size: "small",
                submit: function () {
                    $scope.model.resetPaging = true;
                    $scope.bindData();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);

        };

        $scope.revalidateSelected = function () {
            var options = {
                selectedItems:  seocheckerHelper.getSelectedItems($scope.model.data),
                view: "/app_plugins/seochecker/dialogs/validation/revalidatevalidationissues.html",
                size: "small",
                submit: function () {
                    $scope.model.resetPaging = true;
                    $scope.bindData();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        };

        $scope.openDocument = function (id) {
            window.open('/umbraco/#/content/content/edit/' + id, '_blank', 'width = 900, height = 800');
        };
        $scope.openTemplate = function (id) {
            window.open('/umbraco#/settings/templates/edit/' + id, '_blank', 'width = 900, height = 800');
        };

        //Initialize
        $scope.initializeData();
    });
angular.module("umbraco")
    .controller("seoChecker.validationqueueController",
    function ($scope, $timeout, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.loaded = true;
        $scope.bindData = function () {
            seocheckerBackofficeResources.initializeValidationqueue().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                seocheckerHelper.syncPath($scope.model.path);
            });
            $scope.timer = $timeout($scope.reloadData, 10000);
        };

        $scope.reloadData = function () {
            $scope.CancelTimer();
            seocheckerBackofficeResources.validationqueue($scope.model).then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
                $scope.timer = $timeout($scope.reloadData, 10000);
            });
        };

        $scope.$on('$destroy', function () {
            $scope.CancelTimer();
        });

        $scope.CancelTimer = function () {
            $timeout.cancel($scope.timer);
        };

        $scope.clearDialog = function () {
            var options = {
                localizationKey: "seoCheckerValidationQueue_confirmMessage",
                view: "/app_plugins/seochecker/dialogs/confirm.html",
                size: "small",
                submit: function () {
                    seocheckerBackofficeResources.clearValidationqueue($scope.model).then(function (res) {
                        $scope.model = res.data;
                        seocheckerHelper.showNotification($scope.model.notificationStatus);
                    });
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);

            //editorService.open({
            //    template: '/app_plugins/seochecker/dialogs/confirm.html',
            //    callback: function (result) {
            //        if (result === true) {

            //        }
            //    },
            //    dialogData: {
            //        localizationKey: 'seoCheckerValidationQueue_confirmMessage'
            //    }
            //});
        };
        $scope.sort = function (column) {
            $scope.model.setSortColumn = column;
            $scope.reloadData();
        };

        $scope.setRecordCount = function () {
            $scope.model.resetPaging = true;
            $scope.reloadData();
        };

        $scope.goToPage = function (pageNumber) {
            $scope.model.paging.currentPage = pageNumber;
            $scope.reloadData();
        };

        $scope.isSortDirection = function (columnName, sortDirection) {
            return seocheckerHelper.isSortDirection(columnName, sortDirection, $scope.model.orderByProperty, $scope.model.orderByDirection);
        }

        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("seoChecker.dashboardController",
    function ($scope, $timeout, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
       
        $scope.bindData = function () {
            seocheckerBackofficeResources.initializeDashboard().then(function (res) {
                $scope.loaded = true;
                $scope.model = res.data;
            });
        };
        
        $scope.upload = function () {
            var fileInput = document.getElementById('selectLicenseFile');
            seocheckerHelper.uploadFiles('uploadlicense', fileInput.files[0], function (result) {
                var fileInfo = JSON.parse(seocheckerHelper.fixJqueryResult(result));
                seocheckerBackofficeResources.processLicenseFile(fileInfo).then(function (res) {
                    var uploadedModel = res.data;
                    seocheckerHelper.showNotification(uploadedModel.notificationStatus);
                    $scope.bindData();
                });
            });
        };
        $scope.bindData();
    });
angular.module("umbraco").controller("seoChecker.ConfirmDialogController", function ($scope, localizationService) {

        $scope.initializeConfirm = function () {
            localizationService.localize($scope.model.localizationKey).then(function (value) {
                $scope.confirmCaption = value;
            });
        };

        $scope.confirm = function() {
            if($scope.model && $scope.model.close) {
                $scope.model.submit();
            }
        };

        $scope.cancel = function () {
            if($scope.model && $scope.model.close) {
                $scope.model.close();
            }
        };

        //Initialize
        $scope.initializeConfirm();
    });
angular.module("umbraco").controller("seoChecker.DeleteRedirectsController", function ($scope, localizationService, seocheckerBackofficeResources, seocheckerHelper) {
    $scope.initializeConfirm = function () {
        $scope.parentModel = $scope.model;
        seocheckerBackofficeResources.initializeDeleteRedirects($scope.parentModel.selectedItems).then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;
        });
    };
    
    $scope.confirm = function () {
        seocheckerBackofficeResources.bulkDeleteRedirects($scope.model).then(function (res) {
            $scope.model = res.data;
            seocheckerHelper.showNotification($scope.model.notificationStatus);
            if($scope.parentModel && $scope.parentModel.submit) {
                $scope.parentModel.submit();
            }
        });


    };

    $scope.cancel = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.close();
        }
    };

    //Initialize
    $scope.initializeConfirm();
});
angular.module("umbraco").controller("seoChecker.EditRedirectsController", function ($scope, localizationService, seocheckerBackofficeResources, seocheckerHelper) {
    $scope.initializeConfirm = function () {
        $scope.parentModel = $scope.model;
        seocheckerBackofficeResources.initializeEditRedirect($scope.parentModel.redirectid).then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;

            $scope.$watch("model.tabs['0'].properties[0].value", function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (!seocheckerHelper.isNullOrUndefined(newVal)) {
                        seocheckerBackofficeResources.getContentTypeOfRedirectUrl(newVal).then(function (res) {
                            $scope.model.tabs[0].properties[1].value.contentType = res.data;
                        });
                    }
                }
            }, true);
        });
    };

    $scope.save = function () {
        seocheckerBackofficeResources.saveRedirect($scope.model).then(function (res) {
            var result = res.data;
            if (!result.isInValid) {
                seocheckerHelper.showNotification(result.notificationStatus);
                if($scope.parentModel && $scope.parentModel.submit) {
                    $scope.parentModel.submit();
                }
            }
        });


    };

    $scope.onCancel = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.close();
        }
    };

    //Initialize
    $scope.initializeConfirm();
});
angular.module("umbraco").controller("seoChecker.ExportRedirectsController", function ($scope, localizationService, seocheckerBackofficeResources, seocheckerHelper) {
    $scope.initializeExport = function () {
        $scope.parentModel = $scope.model;
        seocheckerBackofficeResources.initializeExportRedirects($scope.dialogData).then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;
        });
    };

    $scope.export = function () {
        
        seocheckerBackofficeResources.exportRedirects($scope.model).then(function (res) {
            $scope.model = res.data;
            if (!$scope.model.isInValid) {
                $scope.parentModel.submit($scope.model);
            }
        });
    };

    $scope.onCancel = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.close();
        }
    };

    //Initialize
    $scope.initializeExport();
});
angular.module("umbraco").controller("seoChecker.ImportRedirectsController", function ($scope, localizationService, seocheckerBackofficeResources, seocheckerHelper, fileManager, $http, $rootScope) {

    $scope.initializeImportRedirects = function () {
        $scope.parentModel = $scope.model;
        seocheckerBackofficeResources.initializeImportRedirects().then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;
            
        });
    };

    $scope.updateModel = function () {
        seocheckerBackofficeResources.redirectUpdateModel($scope.model).then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;

        });
    };

    $scope.import = function () {
        seocheckerBackofficeResources.importRedirects($scope.model).then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;

        });
    };

    $scope.exportErrors = function () {
        var url = seocheckerBackofficeResources.getExportRedirectErrorsUrl($scope.model);
        seocheckerHelper.downloadFile(url);
    };

    $rootScope.$on("seodropdown.changed", function (event, data) {
        if (data.alias === 'worksheet') {
            $scope.model.resetWorksheet = true;
            $scope.updateModel();
        }
        if (data.alias === 'importProvider') {
            seocheckerBackofficeResources.bindImportRedirects($scope.model).then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
            
            });
        }
    });

    $scope.upload = function () {
        var fileInput = document.getElementById('uploadSeoFile');
        seocheckerHelper.uploadFiles('redirectimport', fileInput.files[0], function (res) {
            var fileInfo = JSON.parse(seocheckerHelper.fixJqueryResult(res));
            $scope.model.importFileInfo = fileInfo;
             $scope.updateModel();
         });
    };

    $scope.showUploadButton = function () {
        return angular.isObject($scope.model) &&  $scope.model.fileSelected === false;
    };

    $scope.showImportButton = function () {
        return angular.isObject($scope.model) && $scope.model.fileSelected === true && $scope.model.fileImported === false;
    };

    $scope.showResult = function () {
        return angular.isObject($scope.model) && $scope.model.fileImported === true;
    };

    $scope.hasImportErrors = function () {
        return angular.isObject($scope.model) && $scope.model.importErrors > 0;
    };

    $scope.getTabByName = function(tabName)
    {
        if (angular.isUndefined($scope.model) ||angular.isUndefined($scope.model.tabs)) {
            return {};
        }
        return seocheckerHelper.getTabByName($scope.model.tabs, tabName);
    }

    $scope.onCancel = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.close();
        }
    };

    $scope.close = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.submit();
        }
    };

    //Initialize
    $scope.initializeImportRedirects();
});
angular.module("umbraco").controller("seoChecker.DeleteConfigurationIssuesController", function ($scope, localizationService, seocheckerBackofficeResources, seocheckerHelper) {
    $scope.initializeConfirm = function () {
        $scope.parentModel = $scope.model;
        seocheckerBackofficeResources.initializeDeleteConfigurationIssues($scope.parentModel.selectedItems).then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;
        });
    };

    $scope.confirm = function () {
        seocheckerBackofficeResources.bulkDeleteConfigurationIssues($scope.model).then(function (res) {
            $scope.model = res.data;
            seocheckerHelper.showNotification($scope.model.notificationStatus);
            if($scope.parentModel && $scope.parentModel.submit) {
                $scope.parentModel.submit();
            }
        });


    };

    $scope.cancel = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.close();
        }
    };

    //Initialize
    $scope.initializeConfirm();
});
angular.module("umbraco").controller("seoChecker.DeleteValidationIssuesController", function ($scope, localizationService, seocheckerBackofficeResources, seocheckerHelper) {
    $scope.initializeConfirm = function () {
        $scope.parentModel = $scope.model;
        seocheckerBackofficeResources.initializeDeleteValidationIssues($scope.parentModel.selectedItems).then(function (res) {
            $scope.model = res.data;
            $scope.loaded = true;
        });
    };
    // <button ng-click="okClick()">OK</button>

    $scope.confirm = function () {
        seocheckerBackofficeResources.bulkDeleteValidationIssues($scope.model).then(function (res) {
            $scope.model = res.data;
            seocheckerHelper.showNotification($scope.model.notificationStatus);
            if($scope.parentModel && $scope.parentModel.submit) {
                $scope.parentModel.submit();
            }
        });
        
        
    };

   
    $scope.cancel = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.close();
        }
    };

    //Initialize
    $scope.initializeConfirm();
});
angular.module("umbraco").controller("seoChecker.RevalidateValidationIssuesController", function ($scope, localizationService, seocheckerBackofficeResources, seocheckerHelper, $timeout) {
    $scope.initialize = function () {
        $scope.parentModel = $scope.model;
        $scope.loaded = false;
        seocheckerBackofficeResources.initializeRevalidateIssues($scope.parentModel.selectedItems).then(function (res) {
            $scope.loaded = true;
            $scope.model = res.data;
            $scope.timer = $timeout($scope.refreshStatus, 1000);
        });
    };
    
    $scope.refreshStatus = function () {
        $scope.timer = $timeout($scope.refreshStatus, 1000);
        seocheckerBackofficeResources.refreshRevalidateIssues($scope.model).then(function (res) {
            $scope.model = res.data;
            if ($scope.model.finished === true) {
                if($scope.parentModel && $scope.parentModel.submit) {
                    $scope.parentModel.submit();
                }
            }
        });
    };

    $scope.onCancel = function () {
        if($scope.parentModel && $scope.parentModel.close) {
            $scope.parentModel.close();
        }
    };

    $scope.$on('$destroy', function () {
        $scope.CancelTimer();
    });

    $scope.CancelTimer = function () {
        $timeout.cancel($scope.timer);
    };

    //Initialize
    $scope.initialize();
});
angular.module("umbraco.directives")
    .directive('seocheckerHeader', function (seocheckerResourceService) {
        return {
            transclude: true,
            restrict: 'E',
            replace: true,
            link: function (scope, element) {
                seocheckerResourceService.localize('SEOChecker').then(function (value) {
                    element.html('<h1>' + value + '</h1>');
                });
            }
        };
    });


angular.module("umbraco.directives")
    .directive('seocheckerLicenseinfo', function (seocheckerBackofficeResources) {
        return {
            transclude: true,
            restrict: 'E',
            replace: true,
            link: function (scope, element) {
                seocheckerBackofficeResources.getLicenseInfo().then(function (res) {
                    if (res.data.licenseError === true) {
                        element.html('<div class="alert alert-error seocheckerLicenseInfo">' + res.data.licenseMessage + '</div>');
                    }
                    if (res.data.trialLicense === true) {
                        element.html('<div class="alert alert-warning seocheckerLicenseInfo">' + res.data.licenseMessage + '</div>');
                    }
                });
            }
        };
    });
function valShowerror() {
    return {
        restrict: "A",
        link: function (scope, element, attrs, ctrl) {

            scope.$watch(function () {
                return scope.$eval(attrs.valShowerror);
            }, function (newVal, oldVal) {
                if (newVal === true) {
                    element.addClass("highlight-error");
                } else {
                    element.removeClass("highlight-error");
                }
            });

        }
    };
}
angular.module('umbraco.directives').directive("valShowerror", valShowerror);
angular.module("umbraco")
    .controller("seoChecker.autovalidationOptionsController",
function ($scope, localizationService, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {

	if (!$scope.model.value) {
        $scope.model.value = "always";
	}
	
    $scope.LocalizePrevalue = function(preval) {
        if (preval === "always") {
            return "Always validate automatically" ;
        }
        if (preval === "aftersave") {
            return "Automatically validate after save" ;
        }
       return "Never validate automatically" ;
    }

	//Initialize
	$scope.model.prevalues = [
					"never",
					"always",
					"aftersave"
	];
});

angular.module("umbraco")
    .controller("seoChecker.booleanFieldController",
    function ($scope, $rootScope) {
        $scope.itemChanged = function (item) {
            item.value = !item.value;
            $rootScope.$broadcast("seobooleanCheckbox.changed", { alias: item.alias, value: item.value });
        };

    });

angular.module("umbraco")
    .controller("seoChecker.dropdownSelectorController",
    function ($scope, $rootScope) {
        $scope.itemChanged = function (item) {
            $rootScope.$broadcast("seodropdown.changed", { alias: item.alias, value: item.value.selectedItem });
        };

    });

angular.module("umbraco")
    .controller("seoChecker.imagePropertyDropdownController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.bindData = function () {

            seocheckerBackofficeResources.getAllImageProperties().then(function (res) {
                $scope.model.items = res.data;
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };
       
        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("seoChecker.propertyDropdownController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {
        $scope.bindData = function () {

            seocheckerBackofficeResources.getAllProperties().then(function (res) {
                $scope.model.items = res.data;
            },
            function (data) {
                seocheckerHelper.showServerError();
            });
        };
       
        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("seoChecker.propertySelectorController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources) {

        $scope.bindData = function () {
            seocheckerBackofficeResources.initializePropertySelectorField($routeParams.id).then(function (res) {
                $scope.properties = res.data;
                $scope.properties.value = $scope.model.value;
                $scope.properties.filterType = $scope.model.config.propertyTypeFilter;
                $scope.initializeValue();
                $scope.loaded = true;
            });
        };

        $scope.initializeValue = function () {
            seocheckerBackofficeResources.initializePropertySelectorValue($scope.properties).then(function (res) {
                $scope.properties = res.data;
                $scope.model.value = $scope.properties.value;
            });
        };
        
        $scope.selectItems = function () {
            seocheckerBackofficeResources.selectPropertySelectorFields($scope.properties).then(function (res) {
                $scope.properties = res.data;
                $scope.model.value = $scope.properties.value;
            });
        };

        $scope.deSelectItems = function () {
            seocheckerBackofficeResources.deSelectPropertySelectorFields($scope.properties).then(function (res) {
                $scope.properties = res.data;
                $scope.model.value = $scope.properties.value;
            });
        };

        $scope.moveUp = function () {
            seocheckerBackofficeResources.moveUpPropertySelectorFields($scope.properties).then(function (res) {
                $scope.properties = res.data;
                $scope.model.value = $scope.properties.value;
            });
        };

        $scope.moveDown = function () {
            seocheckerBackofficeResources.moveDownPropertySelectorFields($scope.properties).then(function (res) {
                $scope.properties = res.data;
                $scope.model.value = $scope.properties.value;
            });
        };

        //Initialize
        $scope.bindData();

    });
angular.module("umbraco")
    .controller("seoChecker.seocontentPickerController",
    function ($scope, $routeParams, notificationsService, editorService) {

        $scope.showDialog = function () {
            var dialogOptions = {
                multiPicker: false,
                startNodeId: null,
                submit: function submit(data) {
                    $scope.model.value.id = data.selection[0].id;
                    $scope.model.value.name = data.selection[0].name;
                    editorService.close();
                },
                close: function close() {
                    editorService.close();
                },
                idType: "int"
            };
            if ($scope.model.value.contentType === 'media') {
                editorService.mediaPicker(dialogOptions);

            } else {

                editorService.contentPicker(dialogOptions);
            }

        };

        $scope.clear = function () {
            $scope.model.value.id = null;
            $scope.model.value.name = '';
        };
      
    });

angular.module("umbraco")
    .controller("seoChecker.notfoundpageFieldController",
        function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {

            //$scope.setAdditionalConfig = function () {
            //    for (var i = 0; i < $scope.model.value.length; i++) {
            //        $scope.model.value[i].config.idType = "udi";
            //    }
            //    $scope.props = $scope.model.value;
            //};
            //$scope.setAdditionalConfig();
        });
angular.module("umbraco")
    .controller("seoChecker.timeSelectorController",
    function ($scope, $routeParams, notificationsService, editorService, seocheckerBackofficeResources, seocheckerHelper) {

        $scope.bindData = function () {
            
            $scope.hours = [];
            for (var h = 0; h < 24; h++) {
                $scope.hours.push(h);
            }

            $scope.minutes = [];
            for (var m = 0; m < 60; m++) {
                $scope.minutes.push(m);
            }
        };

        //Initialize
        $scope.bindData();
        
    });
angular.module("umbraco")
	.controller("seoChecker.redirectsController",
		function ($scope, $routeParams, $http, editorService, notificationsService, localizationService) {
			var nodeId = $routeParams.id;
		  
			$scope.bindData = function () {
				$http.get('backoffice/SEOChecker/SEOCheckerApi/GetRedirects?id=' + nodeId).then(function (res) {
					$scope.redirects = res.data;
				});

				localizationService.localize("seoCheckerGeneral_deleteConfirm").then(function (value) {
				    $scope.confirmMessage = value;
				});

				localizationService.localize("redirectDataType_notificationDeleteTitle").then(function (value) {
				    $scope.notificationDeleteTitle = value;
				});

				localizationService.localize("redirectDataType_notificationDeleteDescription").then(function (value) {
				    $scope.notificationDeleteDescription = value;
				});
				localizationService.localize("redirectDataType_notificationSaveTitle").then(function (value) {
				    $scope.notificationSaveTitle = value;
				});

				localizationService.localize("redirectDataType_notificationSaveDescription").then(function (value) {
				    $scope.notificationSaveDescription = value;
				});

			};

			$scope.deleteRedirect = function (redirectId) {
			    if (confirm($scope.confirmMessage) == true) {
					$http.get('backoffice/SEOChecker/SEOCheckerApi/DeleteRedirect?id=' + redirectId).then(function () {
						$scope.bindData();
						notificationsService.success($scope.notificationDeleteTitle, $scope.notificationDeleteDescription);
					});
				}
			};
			
			$scope.setEditMode = function (redirectId) {
				$scope.validationResult = null;
				$http.get('backoffice/SEOChecker/SEOCheckerApi/GetEmptyModel?id=' + nodeId).then(function (res) {
					//Default set to empty value
					$scope.model.value = res.data;
					for (var i = 0; i < $scope.redirects.length; i++) {
						if ($scope.redirects[i].notFoundId == redirectId) {
							//Redirect found to edit use this one
							$scope.model.value = $scope.redirects[i];
						}
					}
					$scope.nodePicked = { id: $scope.model.value.documentID, name: $scope.model.value.documentName };
					
				});
				$scope.editMode = true;
			};

			$scope.cancelEditMode = function () {
				$scope.editMode = false;
			};
			
			$scope.submitRedirect = function () {
				$scope.model.value.documentID = $scope.getPickedNodeId();
				$http.post('backoffice/SEOChecker/SEOCheckerApi/SaveRedirect', $scope.model.value).then(function (res) {
					$scope.validationResult = res.data;
					if (res.data.valid == true) {
						//All is valid
						$scope.bindData();
						$scope.editMode = false;
						notificationsService.success($scope.notificationSaveTitle, $scope.notificationSaveDescription);
					}
				});
			};

			$scope.pickContentNode = function () {

				//When button clicked - Let's open the content picker dialog on the right
				editorService.contentPicker({ callback: itemPicked });

				//When the node has been picked - do this...
				function itemPicked(pickedItem) {

					//Set the picked item to our scope
					$scope.nodePicked = pickedItem;
				}
			};
			
			$scope.getPickedNodeId = function () {
				if ($scope.nodePicked == null) {
					return 0;
				} else {
					return $scope.nodePicked.id;
				}
			};
			
			$scope.deletePickedNode = function () {
				$scope.nodePicked = null;
			};

			//Initialize
			$scope.bindData();
		});
angular.module("umbraco.resources")
    .factory("seocheckerBackofficeResources", function ($http) {
        return {
            //LicenseInfo
            getLicenseInfo: function () {
                return $http.get("backoffice/seochecker/seocheckerlicenseinfoapi/licenseinfo");
            },
            //validation
            initializeValidationForm: function (id) {
                return $http.get("backoffice/seochecker/seocheckervalidateapi/initialize", { params: { id: id } });
            },

            validate: function (validateOptions) {
                return $http.post("backoffice/seochecker/seocheckervalidateapi/validate", validateOptions);
            },
            saveValidation: function (validateOptions) {
                return $http.post("backoffice/seochecker/seocheckervalidateapi/saveValidation", validateOptions);
            },
            // validation queue
            initializeValidationqueue: function () {
                return $http.post("backoffice/seochecker/seocheckervalidationqueueapi/initializemodel");
            },
            validationqueue: function (model) {
                return $http.post("backoffice/seochecker/seocheckervalidationqueueapi/initialize", model);
            },
            clearValidationqueue: function (model) {
                return $http.post("backoffice/seochecker/seocheckervalidationqueueapi/clearvalidationqueue", model);
            },
            //validation issues
            initializevalidationIssues: function () {
                return $http.post("backoffice/seochecker/validationissuesapi/initializemodel" );
            },
            validationIssues: function (model) {
                return $http.post("backoffice/seochecker/validationissuesapi/initialize", model);
            },
            //validation issues
            initializeIgnoredValidationIssues: function () {
                return $http.post("backoffice/seochecker/ignoredvalidationissuesapi/initializemodel");
            },
            ignoredValidationIssues: function (model) {
                return $http.post("backoffice/seochecker/ignoredvalidationissuesapi/initialize", model);
            },
            //validation issues
            removeIgnoredValidationIssues: function (model) {
                return $http.post("backoffice/seochecker/ignoredvalidationissuesapi/removefromignorelist", model);
            }
            ,
            //Ignored configuration issues
            initializeignoredConfigurationIssues: function () {
                return $http.post("backoffice/seochecker/ignoredconfigurationissuesapi/initializemodel");
            },
            ignoredConfigurationIssues: function (model) {
                return $http.post("backoffice/seochecker/ignoredconfigurationissuesapi/initialize", model);
            },
            removeIgnoredConfigurationIssues: function (model) {
                return $http.post("backoffice/seochecker/ignoredconfigurationissuesapi/removefromignorelist", model);
            },

            //redirect manangerer
            initializeRedirects: function () {
                return $http.post("backoffice/seochecker/redirectmanagementapi/initializemodel");
            },
            loadAllRedirects: function (model) {
                return $http.post("backoffice/seochecker/redirectmanagementapi/initialize", model);
            },
            //ignored inbond links mananer
            initializeInBoundLinkErrors: function () {
                return $http.post("backoffice/seochecker/inboundlinkerrorsapi/initializemodel");
            },
            loadAllInBoundLinkErrors: function (model) {
                return $http.post("backoffice/seochecker/inboundlinkerrorsapi/initialize", model);
            },
            saveInBoundLinkErrors: function (model) {
                return $http.post("backoffice/seochecker/inboundlinkerrorsapi/saveinboundlinkerrors", model);
            },
            //ignored inbond links mananer
            initializeIgnoredInBoundLinkErrors: function () {
                return $http.post("backoffice/seochecker/ignoredinboundlinkerrorsapi/initializemodel");
            },
            loadAllIgnoredInBoundLinkErrors: function (model) {
                return $http.post("backoffice/seochecker/ignoredinboundlinkerrorsapi/initialize", model);
            },
            //validation issues
            removeIgnoredInboundLinkIssues: function (model) {
                return $http.post("backoffice/seochecker/redirectmanagementapi/removefromignorelist", model);
            },

            getContentTypeOfRedirectUrl: function (oldUrl) {
                return $http.get("backoffice/seochecker/redirectmanagementapi/getContentTypeOfRedirectUrl", { params: { redirectUrl: oldUrl } });
            },
            //configurationIssues
            initializeConfigurationIssues: function () {
                return $http.post("backoffice/seochecker/configurationissuesapi/initializemodel");
            },
            configurationIssues: function (model) {
                return $http.post("backoffice/seochecker/configurationissuesapi/initialize", model);
            },
            // My Notifications
            initializeNotifications: function () {
                return $http.get("backoffice/seochecker/seocheckernotificationsapi/initialize");
            },
            saveNotifications: function (notificationsConfig) {
                return $http.post("backoffice/seochecker/seocheckernotificationsapi/save", notificationsConfig);
            },
            //Email settings
            initializeEmailSettings: function (emailTemplate) {
                return $http.get("backoffice/seochecker/emailsettingsapi/initialize", { params: { emailConfig: emailTemplate } });
            },
            saveEmailSettings: function (emailConfig) {
                return $http.post("backoffice/seochecker/emailsettingsapi/save", emailConfig);
            }
            ,
            //Domain settings
            initializeDomainSettings: function (nodeId) {
                return $http.get("backoffice/seochecker/domainsettingsapi/initialize", { params: { rootNodeId: nodeId } });
            },
            saveDomainSettings: function (domainConfig) {
                return $http.post("backoffice/seochecker/domainsettingsapi/save", domainConfig);
            }
            ,
            //Domain settings
            initializeDefinitionSettings: function (alias) {
                return $http.get("backoffice/seochecker/definitionsettingsapi/initialize", { params: { alias: alias } });
            },
            saveDefinitionSettings: function (domainConfig) {
                return $http.post("backoffice/seochecker/definitionsettingsapi/save", domainConfig);
            }
            ,
            //General settings
            initializeGeneralSettingsModel: function() {
                return $http.post("backoffice/seochecker/generalsettingsapi/initializeemptymodel");
            },
            initializeGeneralSettings: function (config) {
                return $http.post("backoffice/seochecker/generalsettingsapi/initialize", config);
            },
            saveGeneralSettings: function (config) {
                return $http.post("backoffice/seochecker/generalsettingsapi/save", config);
            },
            //Permission settings
            initializePermissionSettings: function () {
                return $http.get("backoffice/seochecker/permissionsettingsapi/initialize");
            },
            savePermissionSettings: function (config) {
                return $http.post("backoffice/seochecker/permissionsettingsapi/save", config);
            },
            //Property Selector field
            initializePropertySelectorField: function (alias) {
                return $http.get("backoffice/seochecker/propertyselectorfieldapi/initialize", { params: { alias: alias } });
            },

            initializePropertySelectorValue: function (propertyConfig) {
                return $http.post("backoffice/seochecker/propertyselectorfieldapi/InitializeValue", propertyConfig);
            },

            selectPropertySelectorFields: function (propertyConfig) {
                return $http.post("backoffice/seochecker/propertyselectorfieldapi/selectitems", propertyConfig);
            },
            deSelectPropertySelectorFields: function (propertyConfig) {
                return $http.post("backoffice/seochecker/propertyselectorfieldapi/deselectitems", propertyConfig);
            }
            ,
            moveUpPropertySelectorFields: function (propertyConfig) {
                return $http.post("backoffice/seochecker/propertyselectorfieldapi/moveup", propertyConfig);
            },
            moveDownPropertySelectorFields: function (propertyConfig) {
                return $http.post("backoffice/seochecker/propertyselectorfieldapi/movedown", propertyConfig);
            },
            //Dialogs
            //ValidationDialog
            initializeDeleteRedirects: function (selectedItems) {
                return $http.post("backoffice/seochecker/deleteredirectsdialogapi/initialize", selectedItems);
            },
            initializeEditRedirect: function (id) {
                return $http.get("backoffice/seochecker/editredirectsdialogapi/initialize", { params: { id: id } });
            },
            saveRedirect: function (model) {
                return $http.post("backoffice/seochecker/editredirectsdialogapi/save", model);
            },
            initializeExportRedirects: function () {
                return $http.get("backoffice/seochecker/exportredirectsdialogapi/initialize");
            },
            initializeImportRedirects: function () {
                return $http.post("backoffice/seochecker/importredirectsdialogapi/initializemodel");
            },
            bindImportRedirects: function (model) {
                return $http.post("backoffice/seochecker/importredirectsdialogapi/initialize", model);
            },
            redirectUpdateModel: function (model) {
                return $http.post("backoffice/seochecker/importredirectsdialogapi/update", model);
            },
            uploadFiles: function (formData) {
                return $http.post("backoffice/seochecker/fileuploadapi/upload",
                    formData,
                    {
                        transformRequest: angular.identity,
                        headers: {
                            "Content-Type": undefined
                        }
                    });
            },

            importRedirects: function (model) {
                return $http.post("backoffice/seochecker/importredirectsdialogapi/import", model);
            },
            getExportRedirectErrorsUrl: function (model) {
                return "backoffice/seochecker/importredirectsdialogapi/exporterrors?id=" + model.exportErrorId;
            },
            exportRedirects: function (model) {
                return $http.post("backoffice/seochecker/exportredirectsdialogapi/export", model);
            },
            getRedirectExportUrl: function (model) {
                return "backoffice/seochecker/exportredirectsdialogapi/doexport?contentTypeExportOptions=" + model.contentTypesToExport.selectedItem + "&dataExportOptions=" + model.dataToExport.selectedItem;
            },
            bulkDeleteRedirects: function (model) {
                return $http.post("backoffice/seochecker/deleteredirectsdialogapi/delete", model);
            },
            initializeDeleteValidationIssues: function (selectedItems) {
                return $http.post("backoffice/seochecker/deletevalidationissuesdialogapi/initialize", selectedItems);
            },
            bulkDeleteValidationIssues: function (model) {
                return $http.post("backoffice/seochecker/deletevalidationissuesdialogapi/delete", model);
            },
            initializeRevalidateIssues: function (model) {
                return $http.post("backoffice/seochecker/revalidateissuesdialogapi/initialize", model);
            },
            refreshRevalidateIssues: function (model) {
                return $http.post("backoffice/seochecker/revalidateissuesdialogapi/refresh", model, { timeout: 100 });
            },
            initializeDeleteConfigurationIssues: function (selectedItems) {
                return $http.post("backoffice/seochecker/deleteconfigurationissuesdialogapi/initialize", selectedItems);
            },
            bulkDeleteConfigurationIssues: function (model) {
                return $http.post("backoffice/seochecker/deleteconfigurationissuesdialogapi/delete", model);
            },
            //Bulk actions on overviews
            clearValidationIssues: function () {
                return $http.post("backoffice/seochecker/validationissuesapi/clearallissues");
            }
            ,
            clearInboundLinkIssues: function () {
                return $http.post("backoffice/seochecker/redirectmanagementapi/clearallissues");
            }
            ,
            clearConfigurationIssues: function () {
                return $http.post("backoffice/seochecker/configurationissuesapi/clearallissues");
            },
            //PropertyEditor prevalues
            getAllProperties: function () {
                return $http.get("backoffice/seochecker/prevalueapi/getallproperties");
            },
            getAllImageProperties: function () {
                return $http.get("backoffice/seochecker/prevalueapi/getallimageproperties");
            },
            //dashboard
            initializeDashboard: function () {
                return $http.get("backoffice/seochecker/seocheckerdashboardapi/initialize");
            },
            processLicenseFile: function (fileInfo) {
                return $http.post("backoffice/seochecker/seocheckerdashboardapi/processlicense", fileInfo);
            },
            //General
            deleteTreeNodeById: function (id) {
                return $http.get("backoffice/seochecker/treeapi/deleteTreeNode", { params: { id: id } });
            }
        };
    });
angular.module("umbraco")
    .controller("seoChecker.seoCheckerPropertyEditorController",
        function ($scope, $routeParams, editorState, $http, seocheckerHelper) {
            var culture = seocheckerHelper.isNullOrUndefined($routeParams.cculture) ? $routeParams.mculture : $routeParams.cculture;
           

            $scope.titleLengthVisible = function () {
                return $scope.editMode && $scope.model.value.seoTitle.length > 0;
            };

            $scope.descriptionLengthVisible = function () {
                return $scope.editMode && $scope.model.value.seoDescription.length > 0;
            };

            //Initialize
            $scope.initializeEditor = function () {
                $scope.blueprintMode = $scope.model.value.isBluePrint === true;
                $scope.editMode = $scope.model.value.isBluePrint === false && $routeParams.section === "content";
                $scope.watchChanges();
            };

            //Validate length
            $scope.validateTitleLength = function () {
                if ($scope.editMode) {
                    var limit = $scope.model.value.config.maxTitleLength;
                    $scope.seoTitleLength = $scope.parseTemplate($scope.model.value.seoTitle).length;

                    if ($scope.seoTitleLength > limit) {
                        $scope.seoTitleLengthClass = "error";
                    } else {
                        $scope.seoTitleLengthClass = "valid";
                    }
                }
            };

            $scope.validateDescriptionLength = function () {
                if ($scope.editMode) {
                    var maxLimit = $scope.model.value.config.maxDescriptionLength;
                    var minLimit = $scope.model.value.config.minDescriptionLength;
                    $scope.seoDescriptionLength = $scope.model.value.seoDescription.length;

                    if ($scope.model.value.seoDescription.length < minLimit ||
                        $scope.model.value.seoDescription.length > maxLimit) {
                        $scope.seoDescriptionLengthClass = "error";
                    } else {
                        $scope.seoDescriptionLengthClass = "valid";
                    }
                }
            };

            $scope.parseTemplate = function (titleValue) {
                titleValue = seocheckerHelper.encodeHtmlBrackets(titleValue);
                if ($scope.editMode && $scope.model.value.snippetTitleTemplate.indexOf('@@seotitle@@') != -1) {
                    return $scope.model.value.snippetTitleTemplate.replace('@@seotitle@@', titleValue);
                }
                return titleValue;
            };

            $scope.formatTitle = function () {
                if ($scope.editMode) {
                    var title = $scope.model.value.seoTitle;
                    if (title == '') {
                        title = $scope.model.value.defaultTitlePropertyValue;
                    }
                    title = $scope.parseTemplate(title);
                    title = $scope.getFirst(title, '', $scope.model.config.maxTitleLength);
                    title = $scope.parseKeyword($scope.model.value.focusKeyword, title);
                    return title;
                }
                return '';
            };

            $scope.formatSnippetUrl = function () {
                if ($scope.editMode) {
                    var url = $scope.model.value.snippetUrl.replace('http://', '');
                    url = $scope.parseKeyword($scope.model.value.focusKeyword, url);
                    return url;
                }
                return '';
            };

            $scope.formatDescription = function () {
                if ($scope.editMode) {
                    var description = $scope.model.value.seoDescription;
                    description = seocheckerHelper.encodeHtmlBrackets(description);

                    if (description == '') {
                        description = $scope.model.value.defaultDescriptionValue;
                    }
                    description = $scope.getFirst(description, '...', $scope.model.config.maxDescriptionLength);
                    description = $scope.parseKeyword($scope.model.value.focusKeyword, description);

                    return description;
                }
                return '';
            };

            $scope.parseKeyword = function (focusKeyword, stringValue) {
                if ($scope.editMode) {
                    //Regular expressions can't handle unicode so therefore a split on words
                    if (!(focusKeyword == null || stringValue == null)) {
                        var valueArray = $scope.parseText(stringValue);
                        for (var i = 0; i < valueArray.length; i++) {
                            var focusArr = focusKeyword.split(' ');
                            for (var y = 0; y < focusArr.length; y++) {
                                if (focusArr[y].length > 0 && focusArr[y].toLowerCase() == valueArray[i].toLowerCase()) {
                                    //should be valid keyword
                                    valueArray[i] = '<strong>' + valueArray[i] + '</strong>';
                                }
                            }
                        }
                        stringValue = valueArray.join("");
                    }

                    return stringValue;
                }
                return '';
            };

            $scope.parseText = function (val) {
                var arr = [];
                var tmp = [];
                var chars = [' ', '"', ',', '.', ':', ';'];
                for (var i = 0; i < val.length; i++) {
                    if (chars.indexOf(val[i]) >= 0) {
                        arr.push(tmp.join(''));
                        arr.push(val[i]);
                        tmp = [];
                    } else {
                        tmp.push(val[i]);
                    }
                }
                arr.push(tmp.join(''));
                return arr;
            };

            //Open keyword selection tool
            $scope.openKeywordSelectionTool = function () {
                window.open($scope.model.value.config.keywordSelectionTool, '_blank', 'width=900,height=700'); return false;
            };

            //Get first x Characters
            $scope.getFirst = function (txt, suffixWhenLonger, limit) {
                if (txt.length > limit) {
                    txt = txt.substring(0, limit) + suffixWhenLonger;
                }

                return txt;
            };

            //Validation

            $scope.doValidatePage = function () {
                var validationModel = {
                    "nodeId": editorState.getCurrent().id,
                    "culture": culture,
                    "focusKeyword": $scope.model.value.focusKeyword
                };
                $scope.showValidationResult = true;
                $scope.validationResult = null;
                $scope.validatingPage = true;
                $http.post('backoffice/SEOChecker/SEOCheckerApi/Validate', validationModel)
                    .then(function (res) {
                        $scope.validationResult = res.data;
                        $scope.validatingPage = false;
                    });
            };

            $scope.watchChanges = function () {
                if ($scope.editMode) {
                    $scope.$watch('model.value.requestId',
                        function () {
                            if ($scope.shouldResetModel()) {
                                $scope.resetModel();
                            }
                            else {
                                if ($scope.model.value.config.validationMode === "always" || $scope.postback && $scope.model.value.config.validationMode === "onsave") {
                                    $scope.doValidatePage();
                                }
                            }
                            $scope.postback = true;
                        });

                    $scope.validateTitleLength();
                    $scope.validateDescriptionLength();
                }
            };
                   
            $scope.shouldResetModel = function () {
                return $scope.model.value.documentId === 0 && editorState.getCurrent().id > 0
            };


            $scope.resetModel = function () {
                $scope.model.value.documentId = editorState.getCurrent().id;
                $http.post('backoffice/SEOChecker/SEOCheckerApi/resetModel', $scope.model.value)
                    .then(function (res) {
                        $scope.model.value = res.data;
                        $scope.initializeEditor();
                    });
            };

            if (seocheckerHelper.isNullOrUndefined($scope.model.value)) {
                $scope.definitionMode = true;

            } else {
                if ($scope.shouldResetModel()) {
                    $scope.resetModel();
                }
                else {
                    $scope.initializeEditor();
                }
            }
        });


angular.module('umbraco.services')
    .factory('seocheckerHelper', function (notificationsService, navigationService, seocheckerBackofficeResources, $timeout) {
        var service = {
            showNotification: function (notificationStatus) {
                if (notificationStatus.isError === false) {
                    notificationsService.success(notificationStatus.header, notificationStatus.description);
                } else {
                    notificationsService.error(notificationStatus.header, notificationStatus.description);
                }
            },
            showServerError: function () {
                notificationsService.error("Server error", "A server error occured");
            }
            ,
            applyValidationErrors: function (source, target) {
                target.isInValid = source.isInValid;
                target.validationMessages = source.validationMessages;
            }

            ,
            syncPath: function (path) {
                navigationService.syncTree({ tree: 'seochecker', path: path });
            },
            isSortDirection: function (columnName, sortDirection, currentSortColumn, currentSortDirection) {
                return columnName === currentSortColumn && sortDirection === currentSortDirection;
            }
            ,
            handleSelectAll: function (selected, items) {
                angular.forEach(items, function (item) {
                    item.selected = selected;
                });
            }
            ,
            getSelectedItems: function (items) {
                var result = [];
                angular.forEach(items, function (item) {
                    if (item.selected === true) {
                        result.push(item);
                    }
                }
                );
                return result;
            },
            anyItemSelected: function (items) {
                var result = false;

                angular.forEach(items, function (item) {
                    if (item.selected === true) {
                        result = true;
                        return;
                    }
                }
                );
                return result === true;
            },
            downloadFile: function (url) {
                var redirectExport = document.createElement('a');
                redirectExport.id = "downloadframe";
                redirectExport.style.display = 'none';
                document.body.appendChild(redirectExport);
                redirectExport.href = url;
                redirectExport.click();
                //remove all traces
                $timeout(function () {
                    document.body.removeChild(redirectExport);
                }, 1000);
            },
            fixJqueryResult: function (result) {
                return result.replace(")]}',", "");
            }
            ,
            uploadFiles: function (folder, file, cb) {
                var formData = new FormData();
                formData.set("folderName",folder);
                formData.set("file", file, file.name);

                // Http Request  since angular fails
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        cb(request.responseText);
                    }
                }

                request.open('POST', "backoffice/seochecker/fileuploadapi/upload");
                request.send(formData);


            },
            getTabByName: function (tabs, name) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].alias === name) {
                        return tabs[i];
                    }
                }

                //just return an empty tab when nothing is found
                return {
                    active: false,
                    alias: 'emptyTab',
                    id: -1,
                    label: 'empty',
                    properties: []
                };
            }
            ,
            updateTab: function (oldModel, newModel, tabName) {

                var newtab = service.getTabByName(newModel.tabs, tabName);
                var oldTabs = service.getTabByName(oldModel.tabs, tabName);

                oldTabs.properties = newtab.properties;
            },
            isNullOrUndefined: function (val) {
                return val === null || angular.isUndefined(val);
            },
            encodeHtmlBrackets: function (val) {
                if (!service.isNullOrUndefined(val)) {
                    val = val.replace('<', '&lt;');
                    val = val.replace('>', '&gt;');
                }
                return val;
            }
        };
        return service;
    });

angular.module("umbraco")
    .controller("seoChecker.seoCheckerSocialPropertyEditorController",
        function ($scope, $routeParams, editorState, $http, seocheckerHelper) {

            if (seocheckerHelper.isNullOrUndefined($scope.model.value)) {
                $scope.definitionMode = true;

            } else {
                $scope.blueprintMode = $scope.model.value.isBluePrint === true;
            }

            $scope.socialImageOrientation = 'Landscape';

            $scope.setClass = function (options) {
                var selectedcss = options.cssClass;
                if (options.selected) {
                    selectedcss = selectedcss + '-active';
                }
                return 'social socialbutton ' + selectedcss;
            }

            $scope.activePreviewType = function (previewType) {
                return true;
            }

            $scope.setFirstItemActive = function () {
                if ($scope.editMode) {
                    var all = $scope.model.value.config.socialNetworkOptionsConfig;
                    if (all.length > 0) {
                        $scope.setActive(all[0], all);
                    }
                }
            }

            $scope.setActive = function (options, all) {
                for (i = 0; i < all.length; i++) {
                    all[i].selected = false;
                }

                options.selected = true;
                $scope.model.activeNetwork = options;

            }

            $scope.parseOgTemplate = function (titleValue) {
                titleValue = seocheckerHelper.encodeHtmlBrackets(titleValue);
                if ($scope.editMode && $scope.model.value.ogSnippetTitleTemplate.indexOf('@@seotitle@@') != -1) {
                    return $scope.model.value.ogSnippetTitleTemplate.replace('@@seotitle@@', titleValue);
                }
                return titleValue;
            };

            $scope.parseTwitterTemplate = function (titleValue) {
                titleValue = seocheckerHelper.encodeHtmlBrackets(titleValue);
                if ($scope.editMode && $scope.model.value.twitterSnippetTitleTemplate.indexOf('@@seotitle@@') != -1) {
                    return $scope.model.value.twitterSnippetTitleTemplate.replace('@@seotitle@@', titleValue);
                }
                return titleValue;
            };

            $scope.renderSocialImage = function () {
                if ($scope.editMode) {
                    if (!seocheckerHelper.isNullOrUndefined($scope.model.value.socialImage)) {
                        $scope.socialImageUrl = $scope.model.value.socialImage.mediaUrl;
                        $scope.socialImageOrientation = $scope.model.value.socialImage.imageOrientation;
                    }
                    else if (!seocheckerHelper.isNullOrUndefined($scope.model.value.defaultImageValue)) {
                        $scope.socialImageUrl = $scope.model.value.defaultImageValue.mediaUrl;
                        $scope.socialImageOrientation = $scope.model.value.defaultImageValue.imageOrientation;
                    }
                    else {
                        $scope.socialImageUrl = null;
                    }
                    if (!seocheckerHelper.isNullOrUndefined($scope.socialImageUrl)) {
                        $scope.socialFacebookImage = $scope.socialImageOrientation === 'Landscape' ? $scope.socialImageUrl + '?width=600&height=314&mode=crop' : $scope.socialImageUrl + '?width=171&height=259&mode=crop';
                        $scope.socialTwitterImage = $scope.socialImageUrl + '?width=135&height=135&mode=crop';
                        $scope.socialTwitterLargeImage = $scope.socialImageUrl + '?width=600&height=314&mode=crop';
                    }
                    else {
                        $scope.socialFacebookImage = null;
                        $scope.socialTwitterImage = null;
                        $scope.socialTwitterLargeImage = null;
                        $scope.socialImageOrientation = null;
                    }
                }
            };

            $scope.formatOgTitle = function () {
                if ($scope.editMode) {
                    var title = $scope.model.value.ogTitle;
                    if (title == '') {
                        title = $scope.model.value.defaultTitlePropertyValue;
                    }
                    title = $scope.parseOgTemplate(title);
                    title = $scope.getFirst(title, '', 60);
                    return title;
                }
                return '';
            };

            $scope.formatTwitterTitle = function () {
                if ($scope.editMode) {
                    var title = $scope.model.value.twitterTitle;
                    if (title == '') {
                        title = $scope.model.value.defaultTitlePropertyValue;
                    }
                    title = $scope.parseTwitterTemplate(title);
                    title = $scope.getFirst(title, '', 60);
                    return title;
                }
                return '';
            };

            $scope.formatOgDescription = function () {
                if ($scope.editMode) {
                    var description = $scope.model.value.ogDescription;
                    if (description == '') {
                        description = $scope.model.value.defaultDescriptionValue;
                    }
                    description = $scope.getFirst(description, '...', $scope.model.config.maxDescriptionLength);
                    description = seocheckerHelper.encodeHtmlBrackets(description);
                    return description;
                }
                return '';
            };

            $scope.formatTwitterDescription = function () {
                if ($scope.editMode) {
                    var description = $scope.model.value.twitterDescription;
                    if (description == '') {
                        description = $scope.model.value.defaultDescriptionValue;
                    }
                    description = $scope.getFirst(description, '...', $scope.model.config.maxDescriptionLength);
                    description = seocheckerHelper.encodeHtmlBrackets(description);
                    return description;
                }
                return '';
            };

            //Get first x Characters
            $scope.getFirst = function (txt, suffixWhenLonger, limit) {
                if (txt.length > limit) {
                    txt = txt.substring(0, limit) + suffixWhenLonger;
                }

                return txt;
            };


            $scope.watchSocialImageChange = function () {
                if ($scope.editMode) {
                    $scope.$watch('imagePicker.model.value',
                        function () {
                            if (!seocheckerHelper.isNullOrUndefined($scope.imagePicker.model.value) && $scope.imagePicker.model.value != '') {
                                $http.get('backoffice/SEOChecker/SEOCheckerApi/GetSocialImage?mediaId=' +
                                    $scope.imagePicker.model.value).then(function (res) {
                                        $scope.model.value.socialImage = res.data;
                                        $scope.renderSocialImage();
                                    });
                            } else {
                                $scope.imagePicker.selectedItem = null;
                                $scope.model.value.socialImage = null;
                                $scope.renderSocialImage();
                            }

                        }
                    )
                };
            };
            $scope.imagePicker = {
                model: {
                    editor: "Umbraco.MediaPicker",
                    label: "Image",
                    description: "",
                    hideLabel: false,
                    view: "mediapicker",
                    alias: "socialImage",
                    validation: {
                        mandatory: false,
                        pattern: ""
                    },
                    config: {
                        multiPicker: false
                    }
                },
                    existingValue: null,
                    hasValue: false
            };

            $scope.getSocialImageValue = function () {
                if (!seocheckerHelper.isNullOrUndefined($scope.model.value) && !seocheckerHelper.isNullOrUndefined($scope.model.value.socialImage)) {
                    return $scope.model.value.socialImage.udi;
                }
                return null;
            };

            function buildimagePickerModel(alias, label, description) {
                return {
                    editor: "Umbraco.MediaPicker",
                    label: label,
                    description: description,
                    hideLabel: false,
                    view: "mediapicker",
                    alias: alias,
                    value: $scope.getSocialImageValue(),
                    validation: {
                        mandatory: false,
                        pattern: ""
                    },
                    config: {
                        multiPicker: false
                    }
                };
            };

            //Initialize
            $scope.initializeEditor = function () {
                $scope.editMode = $scope.model.value.isBluePrint === false && $routeParams.section === "content";
                $scope.imagePicker.model = buildimagePickerModel('socialImage', 'Image', 'Social image picker');
                $scope.setFirstItemActive();
                $scope.watchSocialImageChange();
                $scope.renderSocialImage();
                $scope.watchChanges();
            };

            $scope.watchChanges = function () {
                if ($scope.editMode) {
                    $scope.$watch('model.value.requestId',
                        function () {
                            if ($scope.shouldResetModel()) {
                                $scope.resetModel();
                            }
                            $scope.postback = true;
                        });
                }
            };

            $scope.shouldResetModel = function () {
                return $scope.model.value.documentId === 0 && editorState.getCurrent().id > 0
            };


            $scope.resetModel = function () {
                $scope.model.value.documentId = editorState.getCurrent().id;
                $http.post('backoffice/SEOChecker/SEOCheckerApi/resetSocialModel', $scope.model.value)
                    .then(function (res) {
                        $scope.model.value = res.data;
                        $scope.initializeEditor();
                    });
            };


            if (seocheckerHelper.isNullOrUndefined($scope.model.value)) {
                $scope.definitionMode = true;

            } else {
                if ($scope.shouldResetModel()) {
                    $scope.resetModel();
                }
                else {
                    $scope.initializeEditor();
                }
            }


        });

