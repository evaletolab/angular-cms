# Shell script to build gh-pages.
# Run from root directory.

# define your rebase directory
BASE_DIR=/angular-cms/
GH_DEST=origin

[ -n "$1" ] && BASE_DIR=$1
[ -n "$2" ] && GH_DEST=$2

# exit on control+c
control_c(){
  echo -en "\n*** Ouch! Exiting ***\n"
  exit 1
}

echo "deploying application on github/$BASE_DIR"

[ -f Gruntfile.js ] || {
  echo "run $0 from root directory"
  exit 1
} 

[ -f node_modules/.bin/grunt ] || {
 echo "grunt is not there, did you ran npm install"
 exit 1
}

# build current version of the aplication
BASE=$BASE_DIR ./node_modules/.bin/grunt 


# switch branch to gh-pages
git checkout gh-pages
[ -f demo/index.html ] ||{
	echo "issue on checkout branch gh-pages"
	exit 1
}

# make hit happy
git pull $GH_DEST gh-pages
git fetch --all
git reset --hard $GH_DEST/gh-pages
git checkout master demo dist

# remove everything and copy the new version
git commit -m "deploy a new version" .

echo "READY to deploy in github gh-pages"
git push $GH_DEST gh-pages && git checkout master

