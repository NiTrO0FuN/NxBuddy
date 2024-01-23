//Hack to wake up React
HTMLTextAreaElement.prototype.addAtCaret = function(text) {
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    nativeTextAreaValueSetter.call(this, `${this.value.substring(0,this.selectionStart)}${text}${this.value.substring(this.selectionEnd,this.value.length)}`);
    this.dispatchEvent(new Event('input', { bubbles: true}));
}

HTMLInputElement.prototype.addAtCaret = function(text) {
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    nativeTextAreaValueSetter.call(this, `${this.value.substring(0,this.selectionStart)}${text}${this.value.substring(this.selectionEnd,this.value.length)}`);
    this.dispatchEvent(new Event('input', { bubbles: true}));
}
