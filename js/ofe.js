

window.onload = function () {
  ofeApp.init();
};


var ofeApp={
  
  init: function(){
    var t=this;
    this.numberKey = parseInt(Math.random()*600000+100000);
    this.keysArray=[];    
    this.fileSize=0;
    this.fileName='';
    this.inputFile=null;
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

  createInputFile: function(event){
    console.log('createInputFile llamado');
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
    console.log('processInputFile llamado');
    this.keysArray=this.tb_keyNumber.getAttribute('value').split('');
    this.processFile('encode');

  },

  setDecodeMode: function(){
    console.log('decode llamado');
    this.keysArray=this.tb_keyNumber.getAttribute('value').split('');
    this.processFile('decode');
  },

  processFile: function(mode){
    console.log('processFile llamado\nmode: '+mode);
    var outputFile=new Uint8Array(this.fileSize);
    var t=this;
    var code=0;
    var variation=0;
    var newCode=0;
    var oldCode=0;
    var position=1;

    switch (mode) {
      case 'encode':
      console.log('encode activado');
      for(var i=0;i<t.fileSize;i++){
        code=t.inputFile[i];        
        variation=t.getVariation(position);
        newCode=code+variation;
        if(newCode>255){
          newCode= parseInt(newCode%255);
        };

        if(code==255){
          console.log('index: '+i+' oc: '+code+' nc: '+newCode+'variation: '+variation);
        }
        
        //Prevents in decode algorithm (variation==newCode) when oldCode=255. In that case it returns oldCode=0 without this change.
        //if(code==255){
        //  newCode=255;
        //}

        outputFile[i]=newCode;
        position++;
        if(position>12){
          position=1;
        };
      };
      console.log('inputFileSize: '+t.fileSize);
      t.saveOutputFile('encoded_' + t.fileName,outputFile);        
        break;

        case 'decode':
        console.log('decode activado');
        for(var i=0;i<t.fileSize;i++){
          newCode=t.inputFile[i];       
          variation=t.getVariation(position);
          /*if(newCode==255){
            oldCode=255;
          } else */if(variation==newCode){
            oldCode=0;
            console.log('index: '+i+' oc: '+oldCode+' nc: '+newCode+'variation: '+variation);
          } else if(variation>=255){
            oldCode=newCode-parseInt(variation%255);
          } else if(variation<255 && variation>newCode){
            oldCode=255+newCode-variation;
          } else if(variation<255 && variation<newCode){
            oldCode=newCode-variation;
          };

          

          outputFile[i]=oldCode;
          position++;
          if(position>12){
            position=1;
          };
        };
        console.log('inputFileSize: '+t.fileSize);
        t.saveOutputFile('decoded_' + t.fileName,outputFile);
        break;

    
      default:
        break;
    }

  },

  getVariation: function(position){
    var variation1=parseInt(this.keysArray[0]*position+this.keysArray[1]*(position+1)+this.keysArray[2]*(position+2)+this.keysArray[3]*Math.sqrt(position)-this.keysArray[4]+Math.sqrt(this.keysArray[5])+15*position);    
    /*if(variation>254){
      variation=parseInt(variation%254);
    }*/
    return variation1; 
  },

  saveOutputFile(fileName,outputFile){

    //plainText=outputFile.join('');
    //ptext='Esto es una prueba';

    var blob = new Blob([outputFile], { type: 'application/octet-stream' });
    var anchor = document.createElement('a');
    
    anchor.download = fileName;
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl = ['application/octet-stream', anchor.download, anchor.href].join(':');
    anchor.click();

    /*var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(plainText));
    pom.setAttribute('download', fileName);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }*/

  }

}