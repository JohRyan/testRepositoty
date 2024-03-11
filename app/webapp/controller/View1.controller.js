sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onRequest: function(){
                this.getOwnerComponent().getRouter().navTo("request");
            },
            onHome: function(){
                this.getOwnerComponent().getRouter().navTo("home");
            }
        });
    });
