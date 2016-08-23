/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

define([
    'app-config',
    'sulusalesorder/model/order',
    'widget-groups'
], function(AppConfig, Order, WidgetGroups) {

    'use strict';

    var constants = {
            widgetUrls: {
                orderInfo: '/admin/widget-groups/order-info',
                orderDetail: '/admin/widget-groups/order-detail{?params*}'
            }
        },

    /**
     * Binds events for the sidebar in the details view
     */
    bindCustomEventsForDetailsSidebar = function() {
            this.sandbox.on('sulu.flow-of-documents.orders.row.clicked', function(data) {
                var routePartials, routeForNavigation;

                if (!!data.route) {
                    this.sandbox.emit('sulu.router.navigate', data.route);

                    // adjusts navigation - takes the first two segments of the url which are needed for the navigation event
                    routePartials = data.route.split('/');
                    routeForNavigation = routePartials[0] + '/' + routePartials[1];
                    this.sandbox.emit('husky.navigation.select-item', routeForNavigation);
                }
            }.bind(this));
        },

        /**
         * Binds events used by the sidebar in the list view
         */
        bindCustomEventsForListSidebar = function() {
            // navigate to edit contact
            this.sandbox.on('sulu.salesorder.orders.sidebar.load', function(id) {
                // get data for sidebar via controller
                getDataForListSidebar.call(this, {
                    data: id,
                    callback: function(contact, account) {
                        this.sandbox.emit(
                            'sulu.sidebar.set-widget',
                                constants.widgetUrls.orderInfo +'?contact=' + contact + '&account=' + account
                        );
                    }.bind(this)
                });
            }, this);
        },

        /**
         * Binds dom events for sidebar
         */
        bindDomEvents = function() {
            this.sandbox.dom.off('#sidebar');

            this.sandbox.dom.on('#sidebar', 'click', function(event) {
                var id = this.sandbox.dom.data(event.currentTarget, 'id');
                this.sandbox.emit('sulu.router.navigate', 'contacts/accounts/edit:' + id + '/details');
                this.sandbox.emit('husky.navigation.select-item', 'contacts/accounts');
            }.bind(this), '#sidebar-account');

            this.sandbox.dom.on('#sidebar', 'click', function(event) {
                var id = this.sandbox.dom.data(event.currentTarget, 'id');
                this.sandbox.emit('sulu.router.navigate', 'contacts/contacts/edit:' + id + '/details');
                this.sandbox.emit('husky.navigation.select-item', 'contacts/contacts');
            }.bind(this), '#sidebar-contact');
        },

        /**
         * Gets data to init list sidebar with correct params values
         * @param payload
         */
        getDataForListSidebar = function(payload) {
            if (!!payload && !!payload.data && !!payload.callback && typeof payload.callback === 'function') {
                var model,
                    order = Order.findOrCreate({id: payload.data});

                order.fetch({
                    success: function(response) {
                        model = response.toJSON();
                        if (!!model.customerAccount && !!model.customerContact) {
                            payload.callback(model.customerContact.id, model.customerAccount.id);
                        } else {
                            this.sandbox.logger.error('received invalid data when initializing sidebar', model);
                        }
                    }.bind(this),
                    error: function() {
                        this.sandbox.logger.error('error while fetching order');
                    }.bind(this)
                });
            } else {
                this.sandbox.logger.error('param for getDataForListSidebar has to be an object with a data attribute and a valid callback (attribute)!');
            }
        };

    return {

        /**
         * Inits sidebar for details view
         * @param sandbox
         * @param data
         */
        initForDetail: function(sandbox, data) {

            var url, uriTemplate;

            this.sandbox = sandbox;

            if (!!data.customerContact && !!data.customerAccount && !!data.status) {
                uriTemplate = this.sandbox.uritemplate.parse(constants.widgetUrls.orderDetail);
                url = uriTemplate.expand({
                    params: {
                        contact: data.customerContact.id,
                        account: data.customerAccount.id,
                        status: data.status.status,
                        locale: AppConfig.getUser().locale,
                        orderDate: data.orderDate,
                        orderNumber: data.number,
                        orderId: data.id
                    }
                });
                bindDomEvents.call(this);
                bindCustomEventsForDetailsSidebar.call(this);
            } else {
                uriTemplate = this.sandbox.uritemplate.parse(constants.widgetUrls.orderDetail);
                url = uriTemplate.expand({params: {}});
            }

            this.sandbox.emit('sulu.sidebar.set-widget', url);
        },

        /**
         * Inits sidebar for the list view
         * @param sandbox
         */
        initForList: function(sandbox) {
            this.sandbox = sandbox;

            if (WidgetGroups.exists('order-info')) {
                bindDomEvents.call(this);
                bindCustomEventsForListSidebar.call(this);
            }
        }
    };
});
