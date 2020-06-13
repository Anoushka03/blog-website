function regEx(){
    function testName(){
    var name = document.getElementsByID("name")[0].value;
    var nameTest = name.search(/[a-zA-Z]/g);
    if (nameTest == -1||name == ""){
    alert("Please enter only letters in this field.");
    }
    }
    // function testEmail(){
    // var zip = document.getElementsByID("input")[1].value;
    // var zipTest = zip.match(/\d/g);
  
    // if (zipTest.length != 5||zip == ""){
    // alert("Please enter 5 numbers in this field.");
    // }
    // }
    testName();
    //testZip();
    }