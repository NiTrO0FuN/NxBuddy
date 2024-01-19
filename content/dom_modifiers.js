//Hack to wake up React
HTMLTextAreaElement.prototype.append = function(text) {
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    nativeTextAreaValueSetter.call(this, this.value + text);
    this.dispatchEvent(new Event('input', { bubbles: true}));
}
