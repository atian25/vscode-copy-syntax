'use strict';

import * as vscode from 'vscode';

const path = require('path');
const pygmentize = require('pygmentize-bundled');
const ncp = require('copy-paste');

export default class CopySyntax {

  exec(code?:String, options: { lang?:String, format?:String, options?} = {}, callback?:Function) {
    const editor = vscode.window.activeTextEditor;

    // get code string  
    const selection = editor.selection;
    if (!selection.isEmpty) {
      code = editor.document.getText(selection);
    } else {
      code = editor.document.getText();
    }

    if (!options.lang) {
      // guest language
      const fileName = editor.document.fileName;
      const extName = (path.extname(fileName) + '').replace(/^\./, '');
      const languageId = editor.document.languageId;
      let lang;

      // get language by markdown code: ```javascript
      if (/^```(.*)\s*/.test(code.toString())) {
        lang = this.config.get('mapping.markdown')[RegExp.$1] || RegExp.$1;
        code = code.replace(/^```.*\r?\n/, '').replace(/```\s*\r?\n?$/, '');
      }

      // get language by vscode languageId
      if (!lang && languageId && languageId !== 'plaintext') {
        lang = this.config.get('mapping.language')[languageId] || languageId;
      }

      // get language by file extension
      if (!lang && extName) {
        lang = this.config.get('mapping.fileExtension')[extName] || extName
      }
      options.lang = lang || this.config.get('defaults.lang') || undefined;
    }

    // normalize options
    options.format = options.format || this.config.get('defaults.format').toString();
    options.options = Object.assign({}, this.config.get('formatters.' + options.format), options.options);

    // default callback handler
    if (!callback) {
      callback = (err, result) => {
        // Display a message box to the user
        if (err) {
          console.warn(err);
          vscode.window.showErrorMessage(err.message);
        } else {
          const msg = `copy-syntax (${options.lang}, ${options.format}) success!`;
          // console.log(result);
          if (this.config.get('showMessage')) {
            vscode.window.showInformationMessage(msg);
          }
          vscode.window.setStatusBarMessage(msg, 3000);
        }
      };
    }

    console.log(`copy syntax with options: ${JSON.stringify(options)}`);

    // highlight
    pygmentize(options, code, (err, result) => {
      if (err) {
        return callback(err, result && result.toString());
      } else {
        // copy to clipboard
        ncp.copy(result.toString(), callback);
      }
    });
  }

  get config() {
    return vscode.workspace.getConfiguration('copy-syntax');
  }
}