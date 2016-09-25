'use strict';

import * as vscode from 'vscode';
import CopySyntax from './CopySyntax';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const copySyntax = new CopySyntax();

    console.log('Congratulations, your extension "vscode-copy-syntax" is now active!');

    context.subscriptions.push(vscode.commands.registerCommand('copySyntax.copy', () => {
        copySyntax.exec();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('copySyntax.copyWithOptions', () => {
        const config = vscode.workspace.getConfiguration('copy-syntax');
        const defaultLanguage = config.get('defaults.lang').toString();
        vscode.window.showInputBox({
            prompt: 'copy syntax as language',
            placeHolder: 'default as ' + defaultLanguage
        }).then(result => {
            copySyntax.exec(null, { lang: result || defaultLanguage });
        });
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}