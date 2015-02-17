//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
angular.module('admin.component')
    .factory('uiRegionService', function (uiRegionHelper, msg, uiFormControl) {
        var m = new msg('Region'),
            Region = function (scope, element, attrs) {
                var $doms = element.find('input');
                this.$inputDom = $($doms[0]);
                this.$pDom = $($doms[1]);
                this.$cDom = $($doms[2]);
                this.$sDom = $($doms[3]);
                this.$aDom = $($doms[$doms.length - 1]);
                this.codeValue = attrs.sValue;
                this.autoWidth = attrs.autoWidth;
                this.mode = attrs.mode || 's';
                this.valueType = attrs.valueType || 'text'; //保存的是文字还是ID
                uiFormControl.apply(this, arguments);
            };
        Region.prototype = $.extend(new uiFormControl(), {

            _init: function () {
                var self = this;
                if (/^\d+$/g.test(this.codeValue)) {  //有区域ID
                    var p, c, s;
                    uiRegionHelper.htmlById(this.codeValue)
                        .then(function (ts) {
                            p = ts[2];
                            c = ts[1];
                            s = ts[0];
                            return uiRegionHelper.getProvince();
                        })
                        .then(function(data){
                            self.$pDom.select2({data: data});
                            if(p){
                                self.$pDom.select2('val', p.id)
                                return uiRegionHelper.getCity(p.id);
                            }
                            else{
                                return null;
                            }
                        })
                        .then(function(data){
                            if(data){
                                self.$cDom.select2({data: data});
                                if(c){
                                    self.$cDom.select2('val', c.id)
                                    return uiRegionHelper.getStreet(c.id);
                                }
                                else{
                                    return null;
                                }
                            }
                        })
                        .then(function(data){
                            if(data){
                                self.$sDom.select2({data: data});
                                if(s){
                                    self.$sDom.select2('val', s.id)
                                }
                            }
                        });
                    this.$inputDom.val(this.codeValue);
                }
                else { //没有则直接加载省
                    uiRegionHelper.getProvince().then(function (data) {
                        this.$pDom.select2({data: data});
                    }.bind(this));
                }

                //
                if(this.attrs.aValue){
                    this.$aDom.val(this.attrs.aValue);
                }

                this.initMode();
                this.initEvent();
            },

            initMode: function () {
                var width = 0;
                switch (this.attrs.mode) {
                    case 'p':
                        width = 120 * 1;
                        this.$pDom.select2({data: []});
                        this.$cDom.remove();
                        this.$sDom.remove();
                        break;
                    case 'c':
                        width = 120 * 2;
                        this.$pDom.select2({data: []});
                        this.$cDom.select2({data: []});
                        this.$sDom.remove();
                        break;
                    default:
                        width = 120 * 3;
                        this.$pDom.select2({data: []});
                        this.$cDom.select2({data: []});
                        this.$sDom.select2({data: []});
                }
                if (this.autoWidth) {
                    this.element.width(width + 60);
                }
            },

            initEvent: function () {
                var self = this;

                //
                this.$pDom.change(function (evt) {
                    uiRegionHelper.getCity(evt.val).then(function (data) {
                        self.$cDom.select2({data: data});
                        self.$sDom.select2({data: []});
                    });

                    //设置值
                    this.$pDom.val(evt.added[this.valueType]);
                    this.$inputDom.val(evt.val);
                }.bind(this));

                //
                this.$cDom.change(function (evt) {
                    uiRegionHelper.getStreet(evt.val).then(function (data) {
                        self.$sDom.select2({data: data});
                    });

                    //设置值
                    this.$cDom.val(evt.added[this.valueType]);
                    this.$inputDom.val(evt.val);
                }.bind(this));

                //
                this.$sDom.change(function (evt) {
                    this.$sDom.val(evt.added[this.valueType]);
                    this.$inputDom.val(evt.val);
                }.bind(this));
            },

            reset: function () {
                this.$inputDom.val('');
                this.$pDom.val('').select2('val', '');
                this.$cDom.val('').select2({data: []});
                this.$sDom.val('').select2({data: []});
            }
        });
        return function(s, e, a, c, t){
            return new Region(s, e, a, c, t);
        };
    });