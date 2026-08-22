Git is a version controlling tool. Suppose for the first time you write someting(code) in file. This is the first version of your file, then if you change this file (write more things in this file) for any reason, this file change into its another version. In this context version actually means the **`modification of code in a file`**. So git track this changes and can controle it.

As a distributed version control system (DVCS),The website git-scm.com acts as the friendly "front door". It doesn't actually store the heavy installer files on its own web server; it redirects your browser to securely fetch them from GitHub's global release network, Apple's update servers, or Linux distribution servers depending on what computer you are using.

https://education.github.com/git-cheat-sheet-education.pdf
https://drive.google.com/file/d/1ALDNmPdG36b1Abu8Ki9GoOFpSf3Ow_jP/view
https://drive.google.com/file/d/1S7dAnOJYzgJce6C8Ka3UGKhUdblWz3hy/view

In a file , not only one but many can update the same file, so every changes will be labeled as **`"version changed file"`**

You can jump into one code version to another. but the question is why jump from one version to another?

Suppose you write code which yoy can remember in a file. Suddenly , you think this might be wrong,  i need to update it. Then you can delete the code you write you remember. 

However, if you write something big that you cant remember, then what you will do in this situation, Its nearly impossible to remeber the 20000 line code you write before.

Here git comes into the picture. You are saying git, hey git , i am writing something in this file, please track this changes and add a version to this modification 

Some jergon about git :

```javascript
// Working directory (workspace where you edit you file)
// Local repository (git private database. The (.git) hidden folder)
// Remote repository
```

Working directory is the folder you are currently working on. Its your workspace. working directory is your active sandbox where you create and edit files.Completely visible files in your file explorer.
Contains unstaged and untracked changes.

The local repository is the git private database(the hidden **`.git`** folder). Purpose is storing permanent, saved project history.Hidden by default.Contains safe snapshots (commits).

So git is a version controlling tool that can control your working directory and can track the change and can versionize you file from file system.

### git version
To check git version , run the below command :
```javascript
// use one of them
git --version
git -v
```

### git config
when we install git, git globally config something which is called git configuration. This configuration depends on how we install the git. To see the global git configuration we can type : 

```javascript
git config --list
```

you will see like this : 
```javascript
diff.astextplain.textconv=astextplain
filter.lfs.clean=git-lfs clean -- %f
filter.lfs.smudge=git-lfs smudge -- %f
filter.lfs.process=git-lfs filter-process
filter.lfs.required=true
http.sslbackend=openssl
http.sslcainfo=C:/Program Files/Git/mingw64/etc/ssl/certs/ca-bundle.crt
core.autocrlf=true
core.fscache=true
core.symlinks=false
pull.rebase=false
credential.helper=manager
credential.https://dev.azure.com.usehttppath=true
init.defaultbranch=master
user.email=baruarudra7@gmail.com
user.name=rudra0700

```

You can see the **`user name`** and **`email`** in configuration, however for the first time after install git, you wont see them. You have to configure user name and email manually so that git can understand who and which account are currently usgin this git configuration.

To set the  user name and email globally, follow below step and press enter:

```
git config --global user.name "username"
```
then again :
```
git config --global user.email "example@gmail.com"
```

To see specifically the username, run this command:
```
git config --global user.name
```

To see specifically the email, run this command:
```
git config --global user.email
```

Then again run the below command to see the changes 
```
git config --list
```

you can change the default branch name into git by runnig the below command :
```
git config --global init.defaultbranch main
```

To see the present working directory in `**gitbash`** terminal, run this command :

```
pwd
```
To create the blank file inside a folder, run the below command
```
type nul > filename
```

## Git commands 

### git status

```
git status
```

The git status command shows you the current state of your working directory and staging area. It lets you see which changes have been staged, which havent and which files arent begin traked by git.

It does not change anything in you repository, it only displays information.

`What git status Tells`

 When you run the command, Git categorizes your files into three main sections:
 
 Changes to be committed (Staged): These are files that you have modified and added to the staging area using git add. They are ready to be saved in your next commit.
 
 Changes not staged for commit (Unstaged): These are files that Git tracks, but you have modified them and have not run git add on them yet. These changes will not be included in your next commit.
 
 Untracked files: These are brand-new files in your folder (like the readme.md you just created) that Git has never seen before. You must run git add on them if you want Git to start tracking them.
 
 Example Output
 
 If you just created your readme.md file and ran the command, the output would look like this:
 
 ```
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	readme.md

nothing added to commit but untracked files present (use "git add" to track)
```

If you do not initialize the git first, you will get an error below :
```
fatal: not a git repository (or any of the parent directories): .git
```

It means our working directory is not yet git local repository.

### git init 
If you want to track your changing into your file, then at first initialize git using below command : 

```
git init
```

You will see like this :
```
Initialized empty Git repository in C:/web development/Project testing/git and github practice/.git/
```

`git init` commands create a hidden .git folder inside your working directory to track your file

Then run again `git status` command. You will see like below:

```
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        readme.md

nothing added to commit but untracked files present (use "git add" to track)
```

`Tracked vs untracked`
if i create a file and does not tracked by git, is called untracked files. Git cant versionize if it is untracked

git can tracked your file using two commands below: 

### git add

```
git add filename 
```

```
git add .
git add --all
```

the first one will tracked only one single file and the other command will track all files and folder inside working directory.

you can also add the multiple file like below:
```
git add index.css index.js
```

In root folder, `git add .` and `git add --all` is same but if you run those command in sub-directory, the result will be same.

Then you will run `git status` command again to see the change. You will see like this : 

```
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   readme.md
```
### git restore
 To unstage a file after modifying run this command :

```
git restore --staged index.js
```

### git commit 
But here is one catch. Its yet half tracked file. Because git just staged this file. This file was into working directory and by running `git add` commnad, git just staged this file. If you want git will fully track this file, you have to commit

To commit run this command : 
```
git commit -m"add : readme file added"
```

To add and commit together, run this command :
```
git commit -a -m"readme file added"
```

After running this command you will see like below :
```
[master (root-commit) 6e726cf] add : readme file added
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 readme.md
```

git will save the commit history. This means this file is commited in git local repository. Then again run this `git status` command to see the change. You will look like this : 

```
On branch master
nothing to commit, working tree clean
```

### git log
git log will show you the commit history with id, date, branch, commit message, author, email like below:

if you run this command : 
```
git log
```

you will see this : 
```
commit 6e726cf8ebc40ab29ba9df293591e45a2b0cc399 (HEAD -> master)
Author: rudra0700 <baruarudra7@gmail.com>
Date:   Tue Aug 18 19:15:19 2026 +0600

add : readme file added
```

You see the long and verbose commit id, we cant memorize this id, so its so important to write meaningful commit message.

Now if you want to see shortcut log status , run this below command : 
```
git log --oneline
```

After several commit you will commit history like this : 
```
72c9154 (HEAD -> master) one line added
6e726cf add : readme file added
```

`NOTICE :` see the word `HEAD`. This means in what position in file system git tracking our change. If we open the file , we will see the latest commit changes unless we go the specific commit history changes.

if you want to see the last 5 commits , run the below command :
```
git log --oneline -5
```


### git reset
Think about a scenario. Suppose you have many commits and you want to go the previous commit. Before reverted to the previous commit, you must remember , when you go to the previous commit, the commited line and staged file will be reverted also, that means you lose the previous commited change

git command for revert below
```
git reset --hard 6e726cf
```

### git revert
if you dont want to clean any commit history and direct go back to any commitid without deleting any commit history, run this command:

```
git revert commitId
```

### git reflog
With ref command you can see the all reference when you commit, revert and all this things. The command is :

```
git reflog
```

### git rm
With  **`git rm`** we can do two things. Number one is delete the file permanently and other one is untrack the file from github local repository.

if you want to delete a file , run this command :
```
git rm help.md
```

`NOTE` : you have to commit even after delete the file, because git must track delete changes. when you run `git rm` command, its just delete the file only from folder peramanently ,but in git database still tracking this removed file, so do a commit that file is not exist and git does not need to worry about that file. 

### git diff
if you want to see the difference you made in your file, run this command :
```
git diff
```

before run the diff command , you must add the file for tracking.

### git show
if you want to see the changes you made through your file
```
git show commitId
```

### git blame
when you want to see who and when changes or add the code in the particular file , run this command and interestingly you can blame any developer:

```
git blame fileName
```

### git branch

Follow git branch naming convention.

To change the default branch name in github, run this command :
```
git branch -M newlyBranchName
```

To see all created branch :

```
git branch --list
```

To create branch :

```
git branch dev/heading-text
```

Switch into the branch :

```
git switch dev/heading-text
```

To create branch and immedietely switch to that branch run below command :

```
git switch -b branch-name
```

Think about a scenario, suppose you have a dev branch and you wrote many lines of code. Now you want to create a new branch and want that your new branch will create with your existing codebase together, run the below command :

```
git checkout -b toBranchName fromBranchNanme
```

Difference organization use difference convention when creating branch name . Example : 

```
git branch dev/heading-text
git branch bugFix/something
```

When you create a branch, the new branch copied from usually main or master branch. You can copy from any branch you want.

After copying branch, working on that branch, you always want to add that changes into main or master branch where you copied from. 
In this scenario you have to merge the changes into main or master branch.

But at first you have to switch to the main first, then you can merge the newly created branch code to your main  branch. 

Run this command to merge :

```javascript
// git switch main - first move to the main first then : 
git merge dev/heading-text
```

After merging , you will find like this : 

```
Updating 86f8083..7cd61c0
Fast-forward
 readme.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
 ```

If you want to delete a branch, you have to careful with deleting branches.

if you use small **`-d`**, it will warn you if something is uncommited into that branch. The command is  :

```
git branch -d dev/heading-text
```

And if you use capital **`-D`**, git wont warn you before deleting that branch which is very very dangerous. You cant retrieve the code you wrote into that branch, So always use small **`-d`**

To delete this branch without warning :

```
git branch -D dev/heading-text
```

If you want to rename a branch name, run the below command :

```javascript
// Note : if you want to rename branch name, make sure you are on that branch you want to change.
git branch -m feature/heading-text
```

### git merge conflict

Think about a scenario. Suppose your team working in a project. You create a branch and changes something on line number 10 in a file and your teammate bob is also create a branch and changes that file on line number 10. Guess what! A merge conflict is occured.

In this scenario, git is so much clever. Git do not take any risk to handle this situation, instead it handover the responsibility to us (developer).

In this situation, we developer need to resolve the conflict. We have to decide which changes will remain. It can be one or another or it can be both. Sometimes we need both developer changes.

If you ever encounter merge conflict, you will see like this :

```
<<<<<<< HEAD
I am rudra. I am a professional programmer rudra.
=======
I am rudra. I am a professional developer.
>>>>>>> dev/heading-text
```

after resolve the merge you will see this in terminal :

```
Merge branch 'dev/heading-text' into fix-text2

# Conflicts:
#       readme.md
#
# It looks like you may be committing a merge.
# If this is not correct, please run
#       git update-ref -d MERGE_HEAD
# and try again.


# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch fix-text2
# All conflicts fixed but you are still merging.
#
# Changes to be committed:
#       modified:   readme.md
```

In this scenario, sometimes command line does not work fine. As you merge conflict is resolve :

type :
```
Esc
```

And then :

```
:wq

```
then press the **`Enter`**.

### git statsh (most important in industry)
Think about a scenario. Suppose you are working on a branch and you did not write something important or useful yet on this file. In that moment, your project manager says, leave this branch you are working on and create a branch right now because we have to working on a new feature that have to ship the production right now as client demand. But you cant  move to the other branch if you do not commit in the branch you are working on.

In this situation, what would you do?

**`git stash`** can be you solution. 

**`git stash`** let you switch the branch without commiting and help you edit the file later with stash id.

The command is :
```
git stash
```

after stash you will find something like this :
```
Saved working directory and index state WIP on master: 6eb9f25 Merge branch 'dev/heading-text' into fix-text2
```

To see stash list and from which branch you did stash, run this command :
```
git stash list
```

To see the stash with details and changes, run this command :
```
git stash show -p
```

If you want to apply changes from stash, you have two choices. If you want to apply the latest stash, you can run this command :

```
git stash pop
```

if you have multiple stash id, run the **`git stash list`** first to see the stash list and in which branch you stashed and take the id and run this command :

```
git stash apply stashId
```

Another scenario of `git stash` is, suppose you want to stash and as well as create a new branch with that stash, run this command :
```
git stash branch branchName
```

it will saved like a draft branch that you can work on it later.

### .gitignore
.gitignore is a file and its a kind of file that if you put something like file and folder , git wont track this file and folder any more

for example you want to ignore the **`.env`** file, write this up into you **`.gitignore`** file :
```
.env
```

if you ignore a folder, write like this :
```javascript
// it will ignore all files included inside build folder
build/
```

Git basically dont track the empty folder. but you can also track empty folder if you keep file inside that empty folder called :
```
.gitkeep
```

Now think about a scenario, suppose you have build folder and this build folder have many files like index.js, index.css and index.html. Now you want only index.js file that will be ignored by git, write like this into you `.gitignore` file :
```javascript
// it will only ignored index.js. The rest of the file wont ignore by git.
build/index.js
```

But there is a catch.Think about a scenario. Suppose you submit **`.env`** file that suppose to ignored by git. However, somehow you pushed that file. Now what would you do?

Remember **`git rm`** command with extra flag **`-cached`**. Run that command first:
```
git rm --cached .env
```

After running this git will delete this **`.env`** file from git local repo, that means git from now wont track this file and immediately you have to commit something that this file is removed like this below. You dont have to run **`git add`** command

```
git commit -m".env file is removed"
```

Then check git status command and you will get surpirsed. From then if you write something on .env file, git wont track this file

### git tag
if you want to mark any commmit as a release, suppose your software made by this commit, tag that commit using this command :
```javascript
//anotated tag
git tag -a v1.0.0 -m"My release 1"
```

suppose you released and you have to patch somthing and then want to release again, then update what you want, run `git add .` and `git commit -m"messaage"` and run the below command:
```javascript
// lightweight tag
git tag v1.1"
```


## Github

This command is for add your local repository to remote repository. `origin` is always indicate remote, if you skip `origin` its local:
```
git remote add origin git@github.com:rudra007/test-git
```

And this command is for push you local repository code to your remote repository code:

```
git push -u origin main
```

Suppose you want to get remote repo code from github (main branch),
to your local repo(main branch), run this command :

```
git pull
```

You can also mention the branch name also :

```
git pull origin main
```

### git remote -v
if you want to see which remote repository hold by your local repository, run this command :
```
git remote -v
```

you will probably see like this :
```
origin  https://github.com/rudra0700/Dev-Vault.git (fetch)
origin  https://github.com/rudra0700/Dev-Vault.git (push)
```

try out `git push  -f`

The -u flag in git push stands for --set-upstream, which creates a permanent tracking link between your local branch and the remote branch. 


### Why Use -u?
When you push a local branch for the very first time, Git does not automatically know where its corresponding remote branch lives. Using -u saves this relationship so you do not have to type the remote name and branch name every single time.

The Key Benefits
Saves Time on Future Pushes: After running git push -u origin main once, you only need to type git push for all future updates on that branch. Git automatically remembers to send the data to origin main. 

Enables Argumentless Pulls: It allows you to use a simple git pull without any extra arguments. Git will instantly know exactly which remote branch to fetch and merge. 

Improves Status Tracking: Running git status will now tell you exactly how many commits your local branch is ahead or behind compared to the remote server. 

Example Breakdown
Take a standard initial command like:
- git push -u origin feature-branch 
- git push: Uploads your local commits to a remote repository.
- -u: Links feature-branch to the remote branch forever.
- origin: The shorthand nickname for your remote server (like GitHub or GitLab).
- feature-branch: The specific branch name you are uploading. 

You only need to use the -u flag the first time you push a brand new branch

