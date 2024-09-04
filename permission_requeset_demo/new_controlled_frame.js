document.addCF = function (e) {
  if (!e.window.attach) {
    throw new Error('window.attach does not exist ');
  }
  return newcontrolledframe = document.createElement('controlledframe');
  // Attach the new window to the new <controlledframe>.

  e.window.attach(newcontrolledframe);
  document.body.appendChild(newcontrolledframe);
}
  ;