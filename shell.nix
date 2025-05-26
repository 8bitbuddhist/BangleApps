with (import <nixpkgs> {});
mkShell {
  buildInputs = [
    eslint
    nodejs
  ];
}