const {
  input,
  div,
  text,
  script,
  domReady,
  textarea,
  style,
} = require("@saltcorn/markup/tags");
const { features } = require("@saltcorn/data/db/state");
const headers =
  features && features.deep_public_plugin_serve
    ? [
        {
          script: "/plugins/public/ckeditor4/ckeditor.js",
        },
      ]
    : [
        {
          script: "https://cdn.ckeditor.com/4.16.0/standard/ckeditor.js",
        },
      ];

const CKEditor4 = {
  type: "HTML",
  isEdit: true,
  blockDisplay: true,
  handlesTextStyle: true,
  configFields: [
    {
      name: "toolbar",
      label: "Toolbar",
      required: true,
      type: "String",
      attributes: { options: ["Standard", "Reduced", "Document"] },
    },
    {
      name: "height",
      label: "Height (em units)",
      type: "Integer",
      default: 10,
    },
  ],
  run: (nm, v, attrs, cls) => {
    const toolbarGroups =
      attrs.reduced || attrs.toolbar === "Reduced"
        ? [
            { name: "basicstyles", groups: ["basicstyles", "cleanup"] },
            { name: "links", groups: ["links"] },

            { name: "insert", groups: ["insert"] },
            {
              name: "paragraph",
              groups: [
                "list",
                "indent",
                "blocks",
                "align",
                "bidi",
                "paragraph",
              ],
            },

            { name: "colors", groups: ["colors"] },
            { name: "others", groups: ["others"] },
          ]
        : attrs.toolbar === "Document"
        ? [
            { name: "basicstyles", groups: ["basicstyles", "cleanup"] },

            { name: "clipboard", groups: ["clipboard", "undo"] },
            {
              name: "editing",
              groups: ["find", "selection", "spellchecker", "editing"],
            },

            { name: "insert", groups: ["insert"] },
            {
              name: "paragraph",
              groups: [
                "list",
                "indent",
                "blocks",
                "align",
                "bidi",
                "paragraph",
              ],
            },
            { name: "styles", groups: ["styles"] },
            { name: "colors", groups: ["colors"] },
            { name: "others", groups: ["others"] },
          ]
        : [
            { name: "basicstyles", groups: ["basicstyles", "cleanup"] },
            { name: "links", groups: ["links"] },

            { name: "clipboard", groups: ["clipboard", "undo"] },
            {
              name: "editing",
              groups: ["find", "selection", "spellchecker", "editing"],
            },

            { name: "insert", groups: ["insert"] },
            {
              name: "paragraph",
              groups: [
                "list",
                "indent",
                "blocks",
                "align",
                "bidi",
                "paragraph",
              ],
            },
            { name: "justify", groups: ["justify"] },
            { name: "styles", groups: ["styles"] },
            { name: "font", groups: ["font"] },
            { name: "colors", groups: ["colors"] },
            { name: "others", groups: ["others"] },
          ];
    const extraPlugins =
      attrs.reduced || attrs.toolbar === "Reduced"
        ? "uploadimage,dialogadvtab"
        : attrs.toolbar === "Document"
        ? "uploadimage,colorbutton,font,justify,dialogadvtab"
        : "uploadimage,dialogadvtab";
    return div(
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
  extraPlugins: ${JSON.stringify(extraPlugins)},
  imageUploadUrl: '/files/upload',
  ${attrs.disabled ? `readOnly: true,` : ``}
  height: "${attrs.height || 10}em",
  toolbarGroups: ${JSON.stringify(toolbarGroups)},
  removeButtons: 'Subscript,Superscript'

} );
CKEDITOR.on('dialogDefinition', function (ev) {
  var dialogName = ev.data.name;
  var dialogDefinition = ev.data.definition;

  if (dialogName === 'table') {
    var addCssClass = dialogDefinition.getContents('advanced').get('advCSSClasses');
    addCssClass['default'] = 'table-grid';
  }
});
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
    );
  },
};

const dependencies = ["@saltcorn/html"];

module.exports = {
  sc_plugin_api_version: 1,
  fieldviews: { CKEditor4 },
  plugin_name: "ckeditor4",
  headers,
  dependencies,
};
