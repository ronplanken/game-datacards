# Contributing to `Game-Datacards`

As the creators and maintainers of this project, we want to ensure that `Game-Datacards` lives and continues to grow and evolve. We would like to encourage everyone to help and support this tool by contributing.

## Code contributions

Here is a quick guide to doing code contributions to the tool.

1. Fork and clone the repo to your local machine `git clone https://github.com/YOUR_GITHUB_USERNAME/game-datacards.git`

2. Create a new branch from `main` with a meaningful name for a new feature or an issue you want to work on, make sure to prefix the branch with the type (ie feature/issue): `git checkout -b feature/your-meaningful-branch-name`

3. Install packages by running:

   ```shellscript
   yarn
   ```

4. If you've added a code that should be tested, ensure the test suite still passes.

   ```shellscript
   yarn test
   ```

5. Try to write some unit tests to cover as much of your code as possible.

6. Ensure your code lints without errors.

   ```shellscript
   yarn lint
   ```

7. Ensure build passes.

   ```shellscript
   yarn build
   ```

8. Push your branch: `git push -u origin feature/your-meaningful-branch-name`

9. Submit a pull request to the upstream Game-Datacards repository.

10. Choose a descriptive title and describe your changes briefly.

## Coding style

Please follow the coding style of the project. Game-Datacards uses eslint and prettier. If possible, enable their respective plugins in your editor to get real-time feedback. The linting can be run manually with the following command: `yarn lint:fix`

## License

By contributing your code to the Game-Datacards GitHub repository, you agree to license your contribution under the GPL-3.0-or-later license.
