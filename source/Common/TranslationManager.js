var TranslationManager=Object.create(Object);

TranslationManager.proto=false;
TranslationManager.attributes=false;

TranslationManager.init=function(proto){
	
	this.proto=proto;
	this.data={};
}

TranslationManager.toString=function(){
	
	if (!this.proto) return 'Translation Manager';
	
	return 'Translation Manager for '+this.proto;
}

TranslationManager.addTranslations=function(language, translations){
	
	this.data[language]=translations;
	
	return this;
}

TranslationManager.get=function(language,text){
	
	if (this.data[language] && this.data[language][text]) {
		return this.data[language][text];
	} else {
	}
	
	//try to get it on the prototype
	
	if (this.proto && this.proto.parent && this.proto.parent.translationManager) {
		return this.proto.parent.translationManager.get(language,text);
	} else {
	}
	
	return text;
	
}

module.exports=TranslationManager;