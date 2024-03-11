sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel"
],
    function (Controller, formatter, JSONModel) {
        "use strict";

        return Controller.extend("project1.component.request.controller.Request_home", {
            formatter: formatter,
            
            onInit: async function(){
                const myRoute = this.getOwnerComponent().getRouter().getRoute("Request_home");
                myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
            },
            onMyRoutePatternMatched: async function(){
                const Request = await $.ajax({
                    type: "get",
                    url: "/odata/v4/request/Request?$orderby=request_date desc&$filter=request_state eq 'B'&$top=3"
                });

                console.log("Request : "+Request.value);

                let RequestModel = new JSONModel(Request.value);
                console.log(RequestModel);
                this.getView().setModel(RequestModel,"RequestModel");
            },
            onRequest_list: function(){
                this.getOwnerComponent().getRouter().navTo("Request");
            },
            onRequest_chart: function(){
                this.getOwnerComponent().getRouter().navTo("Request_chart");
            },
            onNavToDetail: function(oEvent){
                var oSource = oEvent.getSource();
                console.log("oSource : "+oSource);
                var oBindingContext = oSource.getBindingContext("RequestModel");
                console.log("oBindingContext : "+oBindingContext);
                if (!oBindingContext) {
                    console.error("Binding context is undefined. Source:", oSource);
                    // 여기서 추가적인 진단 로직을 수행할 수 있습니다.
                    return;
                }
            
                let oModel = this.getView().getModel("RequestModel");
                console.log(oModel);
                var SelectedNum = oBindingContext.getProperty("request_number");
                console.log("SelectedNum : "+SelectedNum);
                this.getOwnerComponent().getRouter().navTo("OrderDetail",{num: SelectedNum});
            },
            onRequestViewToStateB: function(){
                this.getOwnerComponent().getRouter().navTo("RequestState");
            }
            
        });
    });
