define(["text!sulusalescore/components/item-table/item.form.html","text!sulusalescore/components/item-table/item.row.html","text!sulusalescore/components/item-table/item.row-head.html","text!sulusalescore/components/item-table/item.overlay.html","config","suluproduct/util/price-calculation-util"],function(a,b,c,d,e,f){"use strict";var g={addressKey:"deliveryAddress",allowDuplicatedProducts:!0,columnCallbacks:{},columns:["name","number","settings","quantity","quantityUnit","price","discount","totalPrice"],data:[],defaultData:{},deliveryCost:0,deliveryCostChangedCallback:null,calculatePrices:!0,displayToolbars:!0,enableDeliveryCost:!1,enableIndependentItems:!1,formId:"item-table-form",hasNestedItems:!1,isEditable:!0,rowCallback:null,settings:!1,showItemCount:!0,shouldDisplayCurrencies:!1,taxfree:!1,urlFilter:{}},h={PRODUCT:0,CUSTOM:1,ADDON:2},i={products:"/admin/api/products{?filter*}",product:"/admin/api/products/",pricing:"/admin/api/pricings"},j={listClass:".item-table-list",formSelector:".item-table-list-form",productSearchClass:".product-search",rowIdPrefix:"item-table-row-",rowClass:".item-table-row",quantityRowClass:".item-quantity",quantityInput:".item-quantity input",priceRowClass:".item-price",priceInput:".item-price input",discountRowClass:".item-discount",discountInput:".item-discount input",globalPriceTableClass:".global-price-table",overallEmptyString:"-",loaderSelector:".item-table-loader",loaderClass:"item-table-loader",overlayClass:"settings-overlay",overlayClassSelector:".settings-overlay",settingsOverlayId:"#settings-overlay",deliveryCostInputId:"#delivery-cost",autocompleteLimit:20,disablePagination:!0},k={itemOverallPrice:".js-item-overall-price",globalPriceValue:".js-global-price-value",itemOverallRecurringPrice:".js-item-overall-recurring-price",globalRecurringPriceValue:".js-global-recurring-price-value",overlayDeliveryDateInput:"#delivery-date input"},l={defaultAddress:"salescore.use-main-delivery-address"},m={rowClass:null,id:null,rowNumber:null,address:null,addressObject:null,description:"",rowId:"",name:"",number:"",quantity:1,quantityUnit:"",price:"",discount:0,overallPrice:"",overallRecurringPrice:"",currency:e.get("sulu_sales_core").default_currency,useProductsPrice:!1,tax:0,supplierName:"",type:h.PRODUCT},n={priceRow:function(a,b,c){return["<tr>","   <td>",a,"   </td>",'   <td class="js-global-recurring-price-value">',b,"   </td>",'   <td class="js-global-price-value">',c,"   </td>","</tr>"].join("")},loader:function(a){return'<div style="display:none" class="grid-row '+a+'"></div>'}},o="sulu.item-table.",p=function(){return x.call(this,"initialized")},q=function(){return o+"changed"},r=function(){return x.call(this,"set-default-data")},s=function(){return x.call(this,"reset-item-addresses")},t=function(){return x.call(this,"update-price")},u=function(){return x.call(this,"change-currency")},v=function(){return x.call(this,"set-addresses")},w=function(){return x.call(this,"get-data")},x=function(a){return o+this.options.instanceName+"."+a},y=function(){return{rowClass:"header",name:this.sandbox.translate("salescore.item.product"),number:this.sandbox.translate("salescore.item.number"),account:this.sandbox.translate("public.company"),customer:this.sandbox.translate("salescore.customer"),supplier:this.sandbox.translate("salescore.supplier"),address:this.sandbox.translate("address.delivery"),description:this.sandbox.translate("salescore.item.description"),quantity:this.sandbox.translate("salescore.item.quantity"),quantityUnit:this.sandbox.translate("salescore.item.unit"),price:this.sandbox.translate("salescore.item.price"),discount:this.sandbox.translate("salescore.item.discount"),overallPrice:this.sandbox.translate("salescore.item.overall-value"),overallRecurringPrice:this.sandbox.translate("salescore.item.overall-recurring-value")}},z=function(){this.sandbox.on(r.call(this),P.bind(this)),this.sandbox.on(u.call(this),J.bind(this)),this.sandbox.on(v.call(this),G.bind(this)),this.sandbox.on(w.call(this),H.bind(this)),this.sandbox.on(s.call(this),I.bind(this)),this.sandbox.on(t.call(this),A.bind(this))},A=function(a){this.options.taxfree=a,Y.call(this)},B=function(){this.sandbox.dom.on(this.$el,"click",ka.bind(this),".add-row"),this.sandbox.dom.on(this.$el,"click",la.bind(this),".add-independent"),this.sandbox.dom.on(this.$el,"click",ha.bind(this),".remove-row"),this.sandbox.dom.on(this.$el,"click",Q.bind(this),".item-table-row .item-name, .item-table-row .item-number"),this.sandbox.dom.on(this.$el,"click",R.bind(this),".item-table-row td"),this.sandbox.dom.on(this.$el,"data-changed",function(a){var b=a.items||[];ua.call(this,b)}.bind(this)),this.sandbox.dom.on(this.$el,"change",S.bind(this),j.quantityInput),this.sandbox.dom.on(this.$el,"change",T.bind(this),j.priceInput),this.sandbox.dom.on(this.$el,"change",U.bind(this),j.discountInput),this.options.enableDeliveryCost===!0&&this.sandbox.dom.on("#item-table-form","focusout",E.bind(this))},C=function(a){D.call(this,a.currentTarget)},D=function(a){var b=$(a),c=this.sandbox.parseFloat(b.val());this.sandbox.dom.isNumeric(c)&&b.val(this.sandbox.numberFormat(c,"n"))},E=function(){var a=this.sandbox.parseFloat($(j.deliveryCostInputId).val());this.sandbox.dom.isNumeric(a)&&($(j.deliveryCostInputId).val(this.sandbox.numberFormat(a,"n")),Y.call(this),this.options.deliveryCostChangedCallback(a))},F=function(a){return this.sandbox.dom.find("#"+a,this.$list)},G=function(a){this.options.settings&&(this.options.settings.addresses=a)},H=function(a){"function"==typeof a&&a(this.getItems())},I=function(a){var b,c;P.call(this,"address",a);for(b in this.items)this.items.hasOwnProperty(b)&&(c=this.items[b],c.address=a)},J=function(a){var b,c,d=new this.sandbox.data.deferred;this.currency=a,b=Object.keys(this.items),b&&b.length>0&&(N.call(this,d),c=ea.call(this,b),this.sandbox.dom.when(c,d).done(function(a){K.call(this),Y.call(this),M.call(this)}.bind(this)).fail(function(a,b,c){this.sandbox.emit("sulu.labels.error.show",this.sandbox.translate("salescore.item-table.error.changing-currency"),"labels.error",""),this.sandbox.logger.error(a,b,c)}.bind(this)))},K=function(){for(var a in this.items)this.items.hasOwnProperty(a)&&(L.call(this,a),X.call(this,a))},L=function(a){var b=this.items[a],c=this.sandbox.dom.find(j.priceInput,F.call(this,a));this.sandbox.dom.val(c,b.priceFormatted)},M=function(){this.sandbox.stop(this.$loader),this.sandbox.dom.show(this.$list)},N=function(a){O.call(this),this.sandbox.start([{name:"loader@husky",options:{el:this.$loader,size:"40px",hidden:!1}}]).done(function(){a.resolve()}.bind(this))},O=function(){var a=this.sandbox.dom.height(this.$el);this.$loader=this.sandbox.dom.createElement(n.loader.call(this,j.loaderClass)),this.$list=this.sandbox.dom.find(j.formSelector,this.$el),this.sandbox.dom.append(this.$el,this.$loader),this.sandbox.dom.height(this.$loader,a),this.sandbox.dom.hide(this.$list),this.sandbox.dom.show(this.$loader)},P=function(a,b){this.options.defaultData[a]=b},Q=function(a){if("INPUT"!==a.target.tagName.toUpperCase()&&"A"!==a.target.tagName.toUpperCase()){var b=$(a.currentTarget).parent(),c=this.sandbox.dom.attr(b,"id");if(this.options.rowCallback&&this.options.rowCallback.call(this,c,this.items[c]),this.items.hasOwnProperty(c)){var d=this.items[c];d.type!==h.ADDON&&this.options.settings&&"false"!==this.options.settings&&za.call(this,this.items[c],this.options.settings,c)}}},R=function(a){var b=this.sandbox.dom.data(a.currentTarget,"name"),c=this.sandbox.dom.data(this.sandbox.dom.parent(),"id");b&&this.options.columnCallbacks.hasOwnProperty(b)&&this.options.columnCallbacks[b].call(this,a.currentTarget,c)},S=function(a){var b=W.call(this,a).id;this.items[b].quantity=this.sandbox.parseFloat(this.sandbox.dom.val(a.target)),V.call(this,b),this.sandbox.emit(q.call(this))},T=function(a){var b=W.call(this,a).id;this.items[b].price=this.sandbox.parseFloat(this.sandbox.dom.val(a.target)),V.call(this,b),this.sandbox.emit(q.call(this))},U=function(a){var b=W.call(this,a).id;this.items[b].discount=this.sandbox.parseFloat(this.sandbox.dom.val(a.target)),V.call(this,b),this.sandbox.emit(q.call(this))},V=function(a){if(this.options.calculatePrices){var b=new this.sandbox.data.deferred;return ea.call(this,a).then(function(){X.call(this,a),Y.call(this),Ha.call(this),b.resolve()}.bind(this)),b}},W=function(a){var b=this.sandbox.dom.closest(a.target,".item-table-row"),c=this.sandbox.dom.attr(b,"id");return{row:b,id:c}},X=function(a){var b=this.$find("#"+a),c=this.items[a],d=this.sandbox.dom.find(".item-overall-price span",b),e=this.sandbox.dom.find(".item-overall-recurring-price span",b);this.sandbox.dom.html(d,aa.call(this,c)),this.sandbox.dom.html(e,aa.call(this,c,!0))},Y=function(){if(this.options.calculatePrices&&-1!==this.options.columns.indexOf("price")){var a=this.getItems(),b=this.$find(j.globalPriceTableClass);if(a&&a.length>0){var c=0,d=0,e=0,g=0,h=0,i=" ";this.options.shouldDisplayCurrencies&&(i=this.currency),this.options.enableDeliveryCost===!0&&(h=this.sandbox.parseFloat($(j.deliveryCostInputId).val()));var l=f.getTotalPricesAndTaxes(this.sandbox,this.items,h),m=f.getTotalPricesAndTaxes(this.sandbox,this.items,0,!0);if(l&&(c=l.netPrice,e=l.grossPrice),m&&(d=m.netPrice,g=m.grossPrice),this.sandbox.dom.empty(b),"undefined"!=typeof c){if(_.call(this,b,this.sandbox.translate("salescore.item.net-price"),f.getFormattedAmountAndUnit(this.sandbox,c,i),f.getFormattedAmountAndUnit(this.sandbox,d,i)),!this.options.taxfree){var n=Z.call(this,[l,m]);n&&n.length&&(n=n.sort(),this.sandbox.util.foreach(n,function(a){var c="",d="";m.taxes&&m.taxes.hasOwnProperty(a)&&(c=m.taxes[a],c=f.getFormattedAmountAndUnit(this.sandbox,c,i)),l.taxes&&l.taxes.hasOwnProperty(a)&&(d=l.taxes[a],d=f.getFormattedAmountAndUnit(this.sandbox,d,i)),_.call(this,b,this.sandbox.translate("salescore.item.vat")+". ("+a+"%)",d,c)}.bind(this))),_.call(this,b,this.sandbox.translate("salescore.item.overall-price"),f.getFormattedAmountAndUnit(this.sandbox,e,i),f.getFormattedAmountAndUnit(this.sandbox,g,i))}$(k.globalPriceValue).outerWidth($(k.itemOverallPrice).outerWidth()),$(k.globalRecurringPriceValue).outerWidth($(k.itemOverallRecurringPrice).outerWidth())}}else this.sandbox.dom.empty(b)}},Z=function(a){var b=[];return this.sandbox.util.foreach(a,function(a){if(a.taxes)for(var c in a.taxes)b.push(c)}),$.unique(b)},_=function(a,b,c,d){var e=this.sandbox.dom.createElement(n.priceRow.call(this,b,d,c));this.sandbox.dom.append(a,e)},aa=function(a,b){ba(a);var c=a.totalNetPriceFormatted,b=!!b;return a.isRecurringPrice!==b?"":(this.options.shouldDisplayCurrencies&&(c+=ca.call(this,a)),c)},ba=function(a){a.isRecurringPrice=a.isRecurringPrice||!1,a.price=a.price||0,a.priceFormatted=a.priceFormatted||0,a.totalNetPriceFormatted=a.totalNetPriceFormatted||0,a.totalNetPrice=a.totalNetPrice||0,a.discount=a.discount||0,a.quantity=a.quantity||0,a.tax=a.tax||0},ca=function(a){return a.currency?a.currency:this.currency},da=function(a,b){var c=this.sandbox.dom.closest(b.currentTarget,j.rowClass),d=this.sandbox.dom.attr(c,"id"),e={};return fa.call(this,a.id)?void this.sandbox.emit("sulu.labels.warning.show",this.sandbox.translate("salescore.item-table.warning.product-already-added"),"labels.warning",""):(this.addedProductIds.push(a.id),this.sandbox.start([{name:"loader@husky",options:{el:this.sandbox.dom.find(j.productSearchClass,c),size:"15px"}}]),void this.sandbox.util.load(i.product+a.id).then(function(a){e=xa.call(this,a),c=qa.call(this,d,e),V.call(this,d).then(function(){L.call(this,d)}.bind(this))}.bind(this)).fail(function(a,b,c){this.sandbox.emit("sulu.labels.error.show",this.sandbox.translate("salescore.item-table.error.loading-product"),"labels.error",""),this.sandbox.logger.error(a,b,c)}.bind(this)))},ea=function(a){if(this.options.calculatePrices){var b=new this.sandbox.data.deferred,c=[];return this.sandbox.dom.isArray(a)||(a=[a]),this.sandbox.util.foreach(a,function(a){c.push(this.items[a])}.bind(this)),this.sandbox.util.save(i.pricing,"POST",{currency:this.currency,taxfree:this.options.taxfree,items:c}).then(function(c){for(var d=-1,e=c.items.length;++d<e;){var f=a[d];this.sandbox.util.extend(this.items[f],c.items[d],{isGrossPrice:!1})}b.resolve()}.bind(this)).fail(function(a,c,d){this.sandbox.emit("sulu.labels.error.show",this.sandbox.translate("salescore.item-table.error.price-update"),"labels.error",""),this.sandbox.logger.error(a,c,d),b.reject()}.bind(this)),b}},fa=function(a){return!this.options.allowDuplicatedProducts&&-1!==this.addedProductIds.indexOf(a)},ga=function(a){var b=e.get("suluproduct.components.autocomplete.default"),c=b.remoteUrl+"{&filter*}{&limit*}{&disablePagination*}";b.remoteUrl=this.sandbox.uritemplate.parse(c).expand({filter:this.options.urlFilter,limit:j.autocompleteLimit,disablePagination:j.disablePagination}),b.el=this.sandbox.dom.find(j.productSearchClass,a),b.selectCallback=da.bind(this),b.limit=j.autocompleteLimit,b.instanceName+=this.rowCount,this.sandbox.start([{name:"auto-complete@husky",options:b}]).then(function(){if(this.$lastAddedRow){var a=this.sandbox.dom.find("input",this.$lastAddedRow)[0];this.sandbox.dom.focus(a),this.$lastAddedRow=null}}.bind(this))},ha=function(a){a.preventDefault(),a.stopPropagation();var b=this.sandbox.dom.closest(a.currentTarget,".item-table-row"),c=this.sandbox.dom.attr(b,"id");ma.call(this,c,b)},ia=function(a){delete this.items[a],Ha.call(this)},ja=function(a,b){this.items[a]=b,Ha.call(this)},ka=function(a){a.preventDefault(),ta.call(this)},la=function(a){a.preventDefault(),za.call(this,m,this.options.settings)},ma=function(a,b){if(this.sandbox.dom.remove(b),this.items[a]&&this.items[a].product){var c=this.addedProductIds.indexOf(this.items[a].product.id);this.addedProductIds.splice(c,1)}ia.call(this,a),sa.call(this,b),Y.call(this),this.sandbox.emit(q.call(this))},na=function(a,c){c||this.rowCount++;var d,e,f=this.sandbox.util.extend({},m,this.options.defaultData,a,{columns:this.options.columns,displayToolbars:this.options.displayToolbars,doDisplayInputs:!0,isEditable:this.options.isEditable,rowId:c?c:j.rowIdPrefix+this.rowCount,rowNumber:this.rowCount,showItemCount:this.options.showItemCount});return f.type===h.ADDON&&(f.doDisplayInputs=!1),f.address&&"object"==typeof f.address&&(f.addressObject=f.address,f.address=this.sandbox.sulu.createAddressString(f.address)),f.currency=this.currency,f.overallPrice=this.sandbox.numberFormat(aa.call(this,f),"n"),f.overallRecurringPrice=this.sandbox.numberFormat(aa.call(this,f,!0),"n"),f.discount=this.sandbox.numberFormat(f.discount,"n"),f.price=this.sandbox.numberFormat(f.price,"n"),f.quantity=this.sandbox.numberFormat(f.quantity,"n"),d=this.sandbox.util.template(b,f),e=this.sandbox.dom.createElement(d)},oa=function(a,b){var c=pa.call(this,a),d=wa.call(this,c,a);return b&&V.call(this,d),Ha.call(this),c},pa=function(a){var b,c;return this.options.hasNestedItems&&(c=a,a=this.sandbox.util.extend({},a.item,c),delete a.item),b=na.call(this,a),this.$lastAddedRow=b,this.sandbox.dom.append(this.$find(j.listClass),b),b},qa=function(a,b){var c=na.call(this,b,a);return this.sandbox.dom.replaceWith(this.$find("#"+a),c),ja.call(this,a,b),ra.call(this,c),this.sandbox.emit(q.call(this)),c},ra=function(a){this.options.columns.indexOf("quantity")>-1&&this.sandbox.form.addField(this.selectorFormId,this.sandbox.dom.find(j.quantityInput,a)),this.options.columns.indexOf("price")>-1&&this.sandbox.form.addField(this.selectorFormId,this.sandbox.dom.find(j.priceInput,a)),this.options.columns.indexOf("discount")>-1&&this.sandbox.form.addField(this.selectorFormId,this.sandbox.dom.find(j.discountInput,a))},sa=function(a){this.options.columns.indexOf("quantity")>-1&&this.sandbox.form.removeField(this.selectorFormId,this.sandbox.dom.find(j.quantityInput,a)),this.options.columns.indexOf("price")>-1&&this.sandbox.form.removeField(this.selectorFormId,this.sandbox.dom.find(j.priceInput,a)),this.options.columns.indexOf("discount")>-1&&this.sandbox.form.removeField(this.selectorFormId,this.sandbox.dom.find(j.discountInput,a))},ta=function(){var a,b={rowClass:"new"};a=pa.call(this,b),ga.call(this,a)},ua=function(a){this.items={},this.sandbox.dom.empty(this.$find(j.listClass)),va.call(this,a)},va=function(a){var b,c;for(b=-1,c=a.length;++b<c;)oa.call(this,a[b]);Ha.call(this)},wa=function(a,b){var c=this.sandbox.dom.attr(a,"id");return this.items[c]=b,c},xa=function(a){var b,c,d=this.sandbox.util.extend({},m,this.options.defaultData,{name:a.name,number:a.number,description:a.shortDescription,product:a,quantityUnit:a.orderUnit?a.orderUnit.name:"",isGrossPrice:a.areGrossPrices,tax:ya.call(this,a),type:h.PRODUCT});if(a.prices&&a.prices.length>0)for(b=-1,c=a.prices.length;++b<c;)a.prices[b].currency.code===this.currency&&(d.price=a.prices[b].price);return a.supplierName&&(d.supplierName=a.supplierName),d},ya=function(a){var b=e.get("sulu_sales_core").shop_location,c=0;return b.length&&a.taxClass&&a.taxClass.countryTaxes&&a.taxClass.countryTaxes.length?(this.sandbox.util.foreach(a.taxClass.countryTaxes,function(a){a.country&&a.country.code.toUpperCase()===b.toUpperCase()&&(c=a)}.bind(this)),c):c},za=function(a,b,c){var e,f,g,h,i=this.sandbox.translate(l.defaultAddress),m=!c,n=m||!a||!a.number;b=this.sandbox.util.extend({columns:[],addresses:[]},b),a[this.options.addressKey]&&(i=this.sandbox.sulu.createAddressString(a[this.options.addressKey]));var o=this.sandbox.util.extend({costCentre:null,createAddressString:this.sandbox.sulu.createAddressString,isIndependent:n,defaultAddressLabel:i,discount:0,deliveryDate:null,description:"",numberFormat:this.sandbox.numberFormat,settings:b,translate:this.sandbox.translate,isEditable:this.options.isEditable},a);o.hasOwnProperty(this.options.addressKey)&&o[this.options.addressKey]||(o[this.options.addressKey]={id:null}),this.sandbox.stop(this.sandbox.dom.find(j.overlayClassSelector,this.$el)),this.sandbox.dom.remove(this.sandbox.dom.find(j.overlayClassSelector,this.$el)),f=this.sandbox.util.template(d,o),e=this.sandbox.dom.createElement('<div class="'+j.overlayClass+'"></div>'),this.sandbox.dom.append("body",e),g=a.name,h=null,n||(h="#"+a.number,a.supplierName&&""!==a.supplierName&&(h+="<br/>"+a.supplierName)),m&&(g=this.sandbox.translate("salescore.create-new-item")),this.sandbox.once("husky.overlay.settings.opened",function(){this.sandbox.form.create(j.settingsOverlayId),Aa.call(this),Ba.call(this),this.sandbox.once("husky.input.settings-delivery-date.initialized",function(){this.options.isEditable||e.find(k.overlayDeliveryDateInput).attr("disabled",!0)}.bind(this))}.bind(this)),this.sandbox.start([{name:"overlay@husky",options:{el:e,title:g,subTitle:h,instanceName:"settings",openOnStart:!0,removeOnClose:!1,skin:"wide",data:f,okCallback:Ca.bind(this,c)}},{name:"input@husky",options:{el:"#delivery-date",skin:"date",instanceName:"settings-delivery-date",inputId:"settings-delivery-date"}}])},Aa=function(){D.call(this,j.settingsOverlayId+" .js-price"),D.call(this,j.settingsOverlayId+" .js-discount"),D.call(this,j.settingsOverlayId+" .js-quantity")},Ba=function(){this.sandbox.dom.on(j.settingsOverlayId,"focusout",C.bind(this),".js-price, .js-discount, .js-quantity")},Ca=function(a){var b=Da.call(this),c=this.sandbox.form.validate(j.settingsOverlayId);return c?void(a?(this.items[a]=this.sandbox.util.extend({},this.items[a],b),qa.call(this,a,this.items[a]),V.call(this,a),Y.call(this,a),Ha.call(this)):(b.type=h.CUSTOM,"undefined"==typeof b.useProductsPrice&&(b.useProductsPrice=!1),oa.call(this,b,!0),this.sandbox.emit(q.call(this)))):!1},Da=function(){var a={},b=Ea.call(this,"deliveryAddress"),c=this.sandbox.dom.data(j.overlayClassSelector+' *[data-mapper-property="deliveryDate"]',"value"),d=Ea.call(this,"costCentre"),e=Ea.call(this,"name");e&&(a.name=e);var f=Ea.call(this,"quantityUnit");f&&(a.quantityUnit=f);var g=Ea.call(this,"tax");g&&(a.tax=g);var h=Ea.call(this,"discount")||"0";return a.discount=this.sandbox.parseFloat(h),a.description=Ea.call(this,"description"),a.quantity=this.sandbox.parseFloat(Ea.call(this,"quantity")),a.price=this.sandbox.parseFloat(Ea.call(this,"price")),a.isRecurringPrice=this.sandbox.dom.find("#is-recurring-price")[0].checked,"-1"!==b&&(a[this.options.addressKey]=Fa.call(this,b)),a.deliveryDate=""!==c?c:null,a.costCentre=""!==d?d:null,a},Ea=function(a){return this.sandbox.dom.val(j.overlayClassSelector+' *[data-mapper-property="'+a+'"]')},Fa=function(a){var b,c,d=this.options.settings.addresses;for(b=-1,c=d.length;++b<c;)if(d[b].id.toString()===a.toString())return d[b];return null},Ga=function(){var a=this.sandbox.util.extend({},m,this.options,{header:y.call(this)}),b=this.sandbox.util.template(c,a);this.sandbox.dom.append(this.$find(j.listClass),b)},Ha=function(){this.sandbox.dom.data(this.$el,"items",this.getItems())},Ia=function(a,b){for(var c=0;c<a.length;c++){var d=a[c];if(!this.options.settings.hasOwnProperty(d))throw{message:b+" options.settings."+d+" not given!"}}},Ja=function(){this.sandbox.form.create(this.selectorFormId)};return{initialize:function(){this.options=this.sandbox.util.extend({},g,this.options),this.selectorFormId="#"+this.options.formId,this.checkOptions(),this.items={},this.rowCount=0,this.addedProductIds=[],this.table=null,this.currency=this.options.currency||m.currency,this.isEmpty=this.items.length;var a=this.sandbox.dom.data(this.$el,"items");0===this.options.data.length&&a&&a.length>0&&(this.options.data=a),this.render(),z.call(this),B.call(this)},render:function(){var b=this.sandbox.util.extend({},{formId:this.options.formId,addText:this.sandbox.translate("salescore.item.add"),isEditable:this.options.isEditable,displayToolbars:this.options.displayToolbars,columns:this.options.columns,showItemCount:this.options.showItemCount,enableIndependentItems:this.options.enableIndependentItems,translate:this.sandbox.translate,deliveryCost:this.sandbox.numberFormat(this.options.deliveryCost,"n"),enableDeliveryCost:this.options.enableDeliveryCost});this.table=this.sandbox.util.template(a,b),this.html(this.table),Ga.call(this),va.call(this,this.options.data),Ja.call(this),Y.call(this),this.sandbox.emit(p.call(this))},checkOptions:function(){var a=["taxClasses","columns"],b=["units"];if(this.options.settings!==!1&&Ia.call(this,a,"Settings overlay cannot be initialized:"),this.options.enableIndependentItems){if(0==this.options.settings){var c="Independent items cannot be added: ";throw c+"options.settings not given!"}Ia.call(this,b,c)}},getItems:function(){var a,b=[];for(a in this.items)b.push(this.items[a]);return b}}});