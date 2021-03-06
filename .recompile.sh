#!/bin/bash
#
# Copyright (c) 2006, 2008 Junio C Hamano
#
# The "pre-rebase" hook is run just before "git rebase" starts doing
# its job, and can prevent the command from running by exiting with
# non-zero status.
#
# The hook is called with the following parameters:
#
# $1 -- the upstream the series was forked from.
# $2 -- the branch being rebased (or empty when rebasing the current branch).
#
# This sample shows how to prevent topic branches that are already
# merged to 'next' branch from getting rebased, because allowing it
# would result in rebasing already published history.

root="$1"
if test "$#" = 1
then
	cd client
	NODE_ENV=$1 npm run build
	cd -
        rm -fR ./public
	mkdir ./public
        cp -R ./client/dist/* ./public/
        cp -R ./client/src/assets/* ./public/
        cp ./callback.html ./public/

        # cp ./client/node_modules/oidc-client/dist/oidc-client.min.js ./public/
else
	echo "Usage: recompile <version> (dev, test, or local)\n";
fi


