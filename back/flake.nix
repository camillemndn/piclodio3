{
  description = "A basic flake with a shell";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default =
          let
            python-packages = p: with p; [
              django
              django-filter
              djangorestframework
              markdown
              drf-yasg
              apscheduler
              sqlalchemy
              psutil
              django-cors-headers
              gunicorn
              pyyaml
              packaging
              (callPackage ./. { })
            ];
          in
          pkgs.mkShell {
            nativeBuildInputs = [ pkgs.bashInteractive ];
            buildInputs = with pkgs; [
              mpg123
              killall
              spotify-tui
              (python3.withPackages python-packages)
            ];
          };

        packages.pyalsaaudio = pkgs.callPackage ./. { };
      });
}



