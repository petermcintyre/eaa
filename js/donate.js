$("#bank-transfer-link").click(function(){
    $("#cheque-details").hide();
    $("#bank-transfer-details").toggle();
});

$("#cheque-link").click(function(){
    $("#bank-transfer-details").hide();
    $("#cheque-details").toggle();
});