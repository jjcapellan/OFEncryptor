/**
* @fileoverview Application to encode/decode files.
*
* @author Juan José Capellán
* @version 1.0b
*/

window.onload = function () {
  ofeApp.init();
};


var ofeApp={
  
  init: function(){
    var t=this;
    // initial Key
    this.numberKey = parseInt(Math.random()*600000+100000);
    // Array with the 6 key digits
    this.keysArray=[];
    //File size in bytes of inputfile    
    this.fileSize=0;
    //File name of inputfile
    this.fileName='';
    this.inputFile=null;

    //HTML DOM elements
    this.tb_keyNumber=document.getElementById('keyNumber');
    this.tb_keyNumber.setAttribute('value',this.numberKey.toString());
    this.lb_inputFile=document.getElementById('lb_inputFile');
    this.el_inputFile=document.getElementById('inputFile');
    this.el_inputFile.addEventListener('change',this.createInputFile.bind(this),false);
    this.bt_encode=document.getElementById('bt_encode');
    this.bt_encode.addEventListener('click',this.setEncodeMode.bind(this),false);
    this.bt_encode=document.getElementById('bt_decode');
    this.bt_encode.addEventListener('click',this.setDecodeMode.bind(this),false);
  },
/**
 * Executed on change event of HTML element el_inputFile
 * 
 * @param {event} event 
 */
createInputFile: function(event){

    var files = event.target.files;
    var reader = new FileReader();
    var t=this;
    reader.onload = function() {
      t.inputFile = new Uint8Array(this.result);
      t.fileSize=t.el_inputFile.files[0].size;
      t.fileName=t.el_inputFile.files[0].name;
      t.lb_inputFile.innerHTML=t.fileName;    
    }  
    reader.readAsArrayBuffer(files[0]);
  },

  setEncodeMode: function(){      
    this.keysArray=this.tb_keyNumber.getAttribute('value').split('');
    this.processFile('encode');

  },

  setDecodeMode: function(){
    this.keysArray=this.tb_keyNumber.getAttribute('value').split('');
    this.processFile('decode');
  },

/**
 * Encode / Decode the inputfile
 * 
 * @param {string} mode ([encode,decode])
 */
processFile: function(mode){
    
    var t=this;
    var code=0; // original byte value (decimal number[0-255])
    var variation=0; // change applied to original byte value
    var newCode=0; // encoded byte value (decimal number [0-255])
    var oldCode=0; // calculated original byte value (decimal number[0-255])
    var position=1; // variable used on variation algorithm

    switch (mode) {

      case 'encode':
      var outputFile=new Uint8Array(this.fileSize*2); // Second byte on each pair is used to indicate 255 value of oldCode
      var limit=t.fileSize;
      for(var i=0;i<limit;i++){
        code=t.inputFile[i];        
        variation=t.getVariation(position);
        newCode=code+variation;
        if(newCode>255){
          newCode= parseInt(newCode%255);
        };

        if(code==255){
          outputFile[i*2+1]=1; // this indicates 255 value in decode process
        };
        if(code==0){
          newCode=0;
        };

        outputFile[i*2]=newCode;
        position++;
        if(position>12){
          position=1;
        };
      };

      t.saveOutputFile('encoded_' + t.fileName,outputFile);        
        break;

        case 'decode':
        var outputFile=new Uint8Array(this.fileSize/2);
        var limit=t.fileSize
        for(var i=0;i<limit;i+=2){

          if(t.inputFile[i+1]==1){
            oldCode=255;
          } else {
          newCode=t.inputFile[i];       
          variation=t.getVariation(position);          
          
          if(variation<255 && variation>newCode){
            oldCode=255+newCode-variation;
          } else if(variation<255 && variation<newCode){
            oldCode=newCode-variation;
          };
          if(newCode==0){
            oldCode=0;
          };
        }                

          outputFile[i/2]=oldCode;
          position++;
          if(position>12){
            position=1;
          };
        };

        t.saveOutputFile('decoded_' + t.fileName,outputFile);
        break;

    
      default:
        break;
    }

  },

/**
 * 
 * 
 * @param {number} position ([1-12])
 * @returns {number} (Increment to apply to the actual byte)
 */
getVariation: function(position){

    var variation1=parseInt(this.keysArray[0]*position+this.keysArray[1]*(position+1)+this.keysArray[2]*(position+2)+this.keysArray[3]*Math.sqrt(position)-this.keysArray[4]+Math.sqrt(this.keysArray[5])+15*position);
    // variation>255 causes a case of ambiguity (ex: 255(oldCode)+261(variation)=261 -- 261%255 --> 6; (decoding)oldCode=newCode-parseInt(variation%255)=0)
    if(variation1>220){
      variation1=parseInt(variation1%220);
    };
    return variation1; 
  },

/**
 * Saves output file on disc
 * 
 * @param {string} fileName 
 * @param {Uint8Array} outputFile 
 */
saveOutputFile(fileName,outputFile){

    var blob = new Blob([outputFile], { type: 'application/octet-stream'});
    var anchor = document.createElement('a');    
    anchor.download = fileName;
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl = ['application/octet-stream', anchor.download, anchor.href].join(':');
    anchor.click();

  }

}