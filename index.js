const {
  input,
  div,
  text,
  script,
  domReady,
  textarea,
  style,
} = require("@saltcorn/markup/tags");

const headers = [
  {
    script: "ckeditor.js",
  },
];

const CKEditor4 = {
  type: "HTML",
  isEdit: true,
  handlesTextStyle: true,
  configFields: [
    {
      name: "reduced",
      label: "Reduced toolbar",
      type: "Bool",
    },
    {
      name: "height",
      label: "Height (em units)",
      type: "Integer",
      default: 10,
    },
  ],
  run: (nm, v, attrs, cls) =>
    div(
      {
        class: [cls],
      },
      textarea(
        {
          name: text(nm),
          id: `input${text(nm)}`,
          rows: 10,
        },
        text(v || "")
      ),
      script(
        domReady(`
var editor = CKEDITOR.replace( '${text(nm)}', {
  extraPlugins: 'uploadimage',
  imageUploadUrl: '/files/upload',
  ${attrs.disabled ? `readOnly: true,` : ``}
  height: "${attrs.height || 10}em",
  toolbarGroups: [
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    { name: 'links', groups: [ 'links' ] },

    ${
      attrs.reduced
        ? ""
        : `{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
    { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },`
    }
		
		{ name: 'insert', groups: [ 'insert' ] },
		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
		${attrs.reduced ? "" : `{ name: 'styles', groups: [ 'styles' ] },`}
		{ name: 'colors', groups: [ 'colors' ] },
		{ name: 'others', groups: [ 'others' ] },
	]
} );

editor.on( 'fileUploadRequest', function( evt ) {
  var fileLoader = evt.data.fileLoader,
      formData = new FormData(),
      xhr = fileLoader.xhr;

  xhr.open( 'POST', fileLoader.uploadUrl, true );
  formData.append( 'file', fileLoader.file, fileLoader.fileName );
  formData.append( 'min_role_read',10 );
  xhr.setRequestHeader( 'CSRF-Token', _sc_globalCsrf );
  xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
  fileLoader.xhr.send( formData );

  // Prevented the default behavior.
  evt.stop();
})

editor.on('fileUploadResponse', function( evt ) {
  evt.stop();
  var data = evt.data,
  xhr = data.fileLoader.xhr,
  response = xhr.responseText;
  const r = JSON.parse(response);
  
  evt.data.uploaded=1;
  evt.data.fileName=r.success.filename;
  evt.data.url=r.success.url;
});
      `)
      )
    ),
};

const dependencies = ["@saltcorn/html"];

module.exports = {
  sc_plugin_api_version: 1,
  fieldviews: { CKEditor4 },
  headers,
  dependencies,
};
