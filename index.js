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
    script: "https://cdn.ckeditor.com/4.16.0/standard/ckeditor.js",
  },
];

const CKEditor4 = {
  type: "HTML",
  isEdit: true,
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
      script(domReady(`CKEDITOR.replace( '${text(nm)}' );`))
    ),
};

const dependencies = ["@saltcorn/html"];

module.exports = {
  sc_plugin_api_version: 1,
  fieldviews: { CKEditor4 },
  headers,
  dependencies,
};
