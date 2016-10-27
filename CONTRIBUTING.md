## Contributing
Since this is a young project a lot of these guidelines may change.

### Guidelines
* Use [jsdoc](http://usejsdoc.org/) conventions to document the code.
* Put stylesheets in the **styles** folder.
* Put images in the **images** folder.
* Put templates in the **templates** folder.
* Put code in the **lib** folder.
* Put tests in the **tests** folder.
* When creating windows add the prefix **window-** in the files.
* Match the structure of lib on the tests folder.
* If you are considering tackling an open issue, comment before if you can so that no work goes to waste.
* Do small and incremental changes so that the pull requests can be easily reviewed and updated.
* Make sure the tests are passing and the linter is not complaining. There is a hook before commiting that checks this.
* **npm run lint:fix** could take care of most of the issues, like line endings (;).
* Install a package on your editor that automatically runs the linter. For example, Atom has **linter-eslint**.
* To package the app use **npm run package:<platform>**. The Windows build requires Wine on linux.
