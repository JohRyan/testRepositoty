sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
],function(Controller, JSONModel, MessageBox, Filter, FilterOperator, Fragment){
    
    "use strict";
    let Today, CreateNum;
    return Controller.extend("project1.component.request.controller.CreateOrder",{
        onInit : async function(){
            const myRoute = this.getOwnerComponent().getRouter().getRoute("CreateOrder");
            myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
            this.onProductData();
        },
        onMyRoutePatternMatched : async function(){
            this.onClearField();
            CreateNum = window.location.href.slice(-10);

            let now = new Date();
            Today = now.getFullYear() + "-" + (now.getMonth()+1).toString().padStart(2,'0')
                + "-" + now.getDate().toString().padStart(2,'0');
            
                this.getView().byId("ReqNum").setText(CreateNum);
                this.getView().byId("ReqDate").setText(Today);
        },
        onProductData: async function(){
            let Product = await $.ajax({
                type: "get",
                url: "/odata/v4/request/Product"
            });
            let ProductModel = new JSONModel(Product.value);
            console.log("ProductModel : "+Product.value);
            this.getView().setModel(ProductModel,"ProductModel");

        },
        onCreate : async function(){
            let temp = new JSONModel(this.temp).oData;

            var pattern_num = /[0-9]/;	// 숫자 
            var pattern_eng = /[a-zA-Z]/;	// 문자 
            var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
            var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

            temp.request_product = this.byId("ReqGood").getValue();
            if(temp.request_product ===""){
                MessageBox.alert("요청 물품을 확인해주세요.", {
                    title: "알림",
                    onClose: function() {
                        this.getView().byId("ReqGood").focus();
                    }.bind(this),
                    actions: MessageBox.Action.OK,
                    emphasizedAction: MessageBox.Action.OK
                });
                return this.getView();
            }
            
            let productName = this.getView().getModel().getData().product_name;
            let productIndex = productName.indexOf(temp.request_product);

            if(productIndex === -1){
                MessageBox.alert("요청 물품은 존재하지 않습니다.", {
                    title: "알림",
                    onClose: function() {
                        this.getView().byId("ReqGood").focus();
                    }.bind(this),
                    actions: MessageBox.Action.OK,
                    emphasizedAction: MessageBox.Action.OK
                });
                return this.getView();
            }
            
            temp.request_quantity = parseInt(this.byId("ReqQty").getValue());
            if(temp.request_quantity < 1 || isNaN(temp.request_quantity)){
                MessageBox.alert("요청 수량을 확인해주세요.", {
                    title: "알림",
                    onClose: function() {
                        this.getView().byId("ReqQty").focus();
                    }.bind(this),
                    actions: MessageBox.Action.OK,
                    emphasizedAction: MessageBox.Action.OK
                });
                return this.getView();
            }
            temp.requestor = this.byId("Requester").getValue();
            if(temp.requestor ==="" || pattern_spc.test(temp.requestor) || pattern_num.test(temp.requestor)){
                MessageBox.alert("요청자를 확인해주세요.", {
                    title: "알림",
                    onClose: function() {
                        this.getView().byId("Requester").focus();
                    }.bind(this),
                    actions: MessageBox.Action.OK,
                    emphasizedAction: MessageBox.Action.OK
                });
                return this.getView();
            }
            temp.request_estimated_price = parseInt(this.byId("ReqPrice").getValue());
            if(temp.request_estimated_price < 1 || isNaN(temp.request_estimated_price)){
                MessageBox.alert("예상 가격을 확인해주세요.", {
                    title: "알림",
                    onClose: function() {
                        this.getView().byId("ReqPrice").focus();
                    }.bind(this),
                    actions: MessageBox.Action.OK,
                    emphasizedAction: MessageBox.Action.OK                    
                });
                return this.getView();
            }
            temp.request_reason = this.byId("ReqReason").getValue();
            if(temp.request_reason ===""){
                MessageBox.alert("요청 사유를 입력해주세요.", {
                    title: "알림",
                    onClose: function() {
                        this.getView().byId("ReqReason").focus();
                    }.bind(this),
                    actions: MessageBox.Action.OK,
                    emphasizedAction: MessageBox.Action.OK                    
                });
                return this.getView();
            }
            temp.request_number = parseInt(CreateNum);
            temp.request_state = "B";
            temp.request_date = Today;

            await fetch("/odata/v4/request/Request",{
                method: "POST",
                body: JSON.stringify(temp),
                headers: {
                    "Content-Type": "application/json;IEEE754Compatible=true",
                },
            })
            this.onBack();
        },
        onClearField: function(){
            this.getView().byId("ReqGood").setValue("");
            this.getView().byId("ReqQty").setValue("");
            this.getView().byId("Requester").setValue("");
            this.getView().byId("ReqPrice").setValue("");
            this.getView().byId("ReqReason").setValue("");
        },
        onBack: function(){
            this.getOwnerComponent().getRouter().navTo("Request");
        },
        onShowProductDialog: function(oEvent){
            this.sInputId = oEvent.getSource().getId();
            console.log("@@"+this.sInputId);
            if (!this.ValueHelpDialog) {
                this.ValueHelpDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.component.request.view.fragment.ValueHelpDialog",
                    controller: this
                }).then(function(oDialog){
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
    
            // open value help dialog
            this.ValueHelpDialog.then(function(oDialog){
                oDialog.open();
            });
        },
        onProductSearch:function(oEvent){
            let sValue = oEvent.getParameter("value");
            var oFilter = new Filter(
                "Name",
                FilterOperator.Contains,sValue
            );
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        onValueHelpClose: function(oEvent){
            let oSelectItem = oEvent.getParameter("selectedItem");
            if(oSelectItem){
                let productInput = this.byId(this.sInputId);
                productInput.setValue(oSelectItem.getTitle());
            }
            oEvent.getSource().getBinding("items").filter([]);
        }
    });
});