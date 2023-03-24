# shell.nix
{ pkgs ? import <nixpkgs> { } }:
let
  pyalsaaudio = pkgs.callPackage /etc/nixos/pkgs/development/python-modules/pyalsaaudio { };
  my-python-packages = p: with p; [
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
    pyalsaaudio

  ];
  my-python = pkgs.python3.withPackages my-python-packages;
in

pkgs.mkShell {
  packages = with pkgs; [
    mpg123
    killall
    (python3.withPackages my-python-packages) # we have defined this in the installation section
  ];
}

