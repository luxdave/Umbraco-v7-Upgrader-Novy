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

