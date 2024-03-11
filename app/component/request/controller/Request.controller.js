sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/m/MessageBox"
], function(Controller, formatter, Filter, FilterOperator, Fragment, Sorter, JSONModel,Spreadsheet, exportLibrary, MessageBox){
    "use strict";

    let totalNumber;
    const EdmType = exportLibrary.EdmType;

    return Controller.extend("project1.component.request.controller.Request",{
        formatter: formatter,
        onInit : async function(){
            const myRoute = this.getOwnerComponent().getRouter().getRoute("Request");
            myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
            const myRouteState = this.getOwnerComponent().getRouter().getRoute("RequestState");
            myRouteState.attachPatternMatched(this.onMyRoutePatternMatchedB, this);
            this.onProductData();
        },
        onMyRoutePatternMatched : function(){
            console.log("@@@onMyRoutePatternMatched@@@");
            this.onClearField();
            this.onDataView();
        },
        onMyRoutePatternMatchedB: async function(){
            console.log("onMyRoutePatternMatchedB");
            const Request = await $.ajax({
                type: "get",
                url: "/odata/v4/request/Request?$orderby=request_date desc&$filter=request_state eq 'B'"
            })
            let RequestModel = new JSONModel(Request.value);
            this.getView().setModel(RequestModel, "RequestModel");
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
        onDataView : async function (){
            const Request = await $.ajax({
                type: "get",
                url: "/odata/v4/request/Request"
            });

            console.log("@@@@@"+Request.value);

            let RequestModel = new JSONModel(Request.value);
            this.getView().setModel(RequestModel, "RequestModel");

            totalNumber = this.getView().getModel("RequestModel").oData.length;

            let TableIndex = "물품 요청 목록 ( "+ totalNumber + " )";
            this.getView().byId("TableName").setText(TableIndex);
        },
        onSearch : function(){
            console.log("@@@Serch@@@");

            let ReqNum = this.byId("ReqNum").getValue();
            let ReqGood = this.byId("ReqGood").getValue();
            let Requester = this.byId("Requester").getValue();
            let ReqDate = this.byId("ReqDate").getValue();
            let ReqStatus = this.byId("ReqStatus").getSelectedKey();

            if(ReqDate){
                let ReqYear = ReqDate.split(". ")[0];
                let ReqMonth = ReqDate.split(". ")[1].padStart(2, '0');
                ReqDate = ReqYear + "-" + ReqMonth;
            }

            var aFilter = [];

            if(ReqNum){aFilter.push(new Filter("request_number", FilterOperator.Contains, ReqNum))}
            if(ReqGood){aFilter.push(new Filter("request_product", FilterOperator.Contains, ReqGood))}
            if(Requester){aFilter.push(new Filter("requestor", FilterOperator.Contains, Requester))}
            if(ReqDate){aFilter.push(new Filter("request_date", FilterOperator.Contains, ReqDate))}
            if(ReqStatus){aFilter.push(new Filter("request_state", FilterOperator.Contains, ReqStatus))}

            let oTable = this.byId("RequestTable").getBinding("rows");
            oTable.filter(aFilter);
        },
        onSort : function(){
            console.log("@@@Sort@@@");
            console.log("ID : "+ this.getView().getId());
            if(!this.byId("SortDialog")){
                Fragment.load({
                    id:this.getView().getId(),
                    name:"project1.component.request.view.fragment.SortDialog",
                    controller: this
                }).then(function(oDialog){
                    this.getView().addDependent(oDialog);
                    oDialog.open("filter");
                }.bind(this));
            } else{
                this.byId("SortDialog").open("filter");
            }
            console.log("@@@SortEnd@@@");

            this.onSearch();
        },
        onConfirmSortDialog: function(oEvent){
            let oBinding = this.byId("RequestTable").getBinding("rows");
            let mParams = oEvent.getParameters();
            let sPath = mParams.sortItem.getKey();
            let bDescending = mParams.sortDescending;
            let aSorters = new Sorter(sPath, bDescending);            
            oBinding.sort(aSorters);
        },
        onCreateOrder: function(){
            let CreateOrder = this.getView().getModel("RequestModel").oData;
            let CreateOrderIndex = CreateOrder.length;
            console.log("CreateOrderIndex : "+ CreateOrderIndex);
            let CreateNum = 0;
            if(CreateOrderIndex === 0){
                CreateNum = 1000000001;    
            } else{
                CreateNum = CreateOrder[CreateOrderIndex - 1].request_number + 1;
            }
            console.log("CreateNum : "+CreateNum);
            this.getOwnerComponent().getRouter().navTo("CreateOrder", {num: CreateNum});
        },
        onClearField: function(){
            this.getView().byId("ReqNum").setValue("");
            this.getView().byId("ReqGood").setValue("");
            this.getView().byId("Requester").setValue("");
            this.getView().byId("ReqDate").setValue("");
            this.getView().byId("ReqStatus").setSelectedKey("");
        },
        onReset : function(){
            this.onClearField();
            this.onSearch();
        },
        onShowRejectReason: async function(oEvent){
            let oItem = oEvent.getSource();
            console.dir(oItem);
            console.log(typeof oItem.getBindingContext);
            let oContext = oItem.getBindingContext("RequestModel");
            
            let sPath = oContext.getPath();
            console.log("sPath : "+sPath);
            let oData = oContext.getModel().getProperty(sPath);
            console.log("oData : "+oData);
            let SelectedNum = oData.request_number;
            console.log("SelectedNum : "+SelectedNum);
            const Request = await $.ajax({
                type: "get",
                url: "/odata/v4/request/Request?$filter=request_number eq "+ SelectedNum
            });
            let RequestModel = new JSONModel(Request.value);
            console.log("RequestModel : " + JSON.stringify(RequestModel));
            let RejectReason = RequestModel.oData[0].request_reject_reason;
            console.log("RejectReason : ", RejectReason);

            

            var oView = this.getView();
            if(!this.nameDialog){
                this.nameDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "project1.component.request.view.fragment.ShowRejectDialog",
                    controller: this
                }).then(function(oDialog){
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this.nameDialog.then(function(oDialog){
                oDialog.open();
                oView.byId("RejectReasonCheck").setText(RejectReason);
            });
        },
        onCancelRejectReason: function(){
            this.byId("ShowRejectDialog").destroy();
            this.nameDialog = null;
        },
        onNavToDetail: function(oEvent){
            let SelectedNum = oEvent.getParameters().row.mAggregations.cells[1].mProperties.text;
            this.getOwnerComponent().getRouter().navTo("OrderDetail", {num: SelectedNum});
            console.log("SelectedNum : "+SelectedNum);
        },
        onDeleteOrder: async function(){
            let model = this.getView().getModel("RequestModel");            
            let cnt = 0;
            let i, chk;
            

            for(i=0; i<totalNumber; i++){    
                chk = '/' + i + '/CHK'
                console.log("model.getProperty(chk) : "+model.getProperty(chk));
                if(model.getProperty(chk)===true){
                    cnt++;
                }
            }
            console.log("cnt : "+ cnt);
            if(cnt===0){
                MessageBox.alert("삭제 항목을 선택해 주세요.",{
                    title: "알림",
                    onClose: null,
                    actions: MessageBox.Action.OK,
                    emphasizedAction: MessageBox.Action.OK
                })
            } else{
                MessageBox.confirm("정말 삭제하시겠습니까?",{
                    title: "확인",
                    onClose: async function(oAction){
                        if(oAction === MessageBox.Action.OK){
                            for(i=0; i<totalNumber; i++){
                                chk = '/' + i + '/CHK'
                                if(model.getProperty(chk) === true){
                                    let key = '/' + i + '/request_number'
                                    let request_number = model.getProperty(key);
                                    await this.onDelete(request_number);
                                }
                            }
                            this.onDataView();
                        }
                    }.bind(this),
                    action:[
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: MessageBox.Action.OK
                })
            }
            
        },
        onDelete: async function(key){
            let url = "/odata/v4/request/Request/" + key;
            await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json;IEEE754Compatible=true"
                }
            })
        },
        onRequesthome: function(){
            this.getOwnerComponent().getRouter().navTo("Request_home");
        },
        onDataExport: function(){
            let aCols, oRowBinding, oSettings, oSheet, oTable;

            oTable = this.byId('RequestTable');
            oRowBinding = oTable.getBinding('rows');
            aCols = this.createColumnConfig();

            let oList = [];
            for(let j=0; j<oRowBinding.oList.length; j++){
                if(oRowBinding.aIndices.indexOf(j)>-1){
                    oList.push(oRowBinding.oList[j]);
                }
            }

            for(let i=0; i<oList.length; i++){
                if(oList[i].request_state ==='A'){
                    oList[i].request_state = '승인';
                }
                if(oList[i].request_state ==='B'){
                    oList[i].request_state = '처리 대기';
                }
                if(oList[i].request_state ==='C'){
                    oList[i].request_state = '반려';
                }
            }
            oSettings = {
                workbook: {
                    columns: aCols, 
                    hierarchyLevel: 'Level'
                },
                dataSource: oList,
                fileName: 'RequestTable.xlsx',
                worker: false
            };
            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function(){
                oSheet.destroy();
            });
        },
        createColumnConfig: function(){
            const aCols = [];

            aCols.push({
                label: '요청 번호',
                property: 'request_number',
                type: EdmType.Int32
            });
            aCols.push({
                label: '요청 물품',
                property: 'request_product',
                type: EdmType.String
            });
            aCols.push({
                label: '요청 개수',
                property: 'request_quantity',
                type: EdmType.Int32
            });
            aCols.push({
                label: '요청자',
                property: 'requestor',
                type: EdmType.String
            });
            aCols.push({
                label: '요청 일자',
                property: 'request_date',
                type: EdmType.String
            });
            aCols.push({
                label: '처리 상태',
                property: 'request_state',
                type: EdmType.String
            });

            return aCols;
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