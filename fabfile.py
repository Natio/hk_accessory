from fabric.api import env
from fabric.operations import run, put
from fabric.context_managers import cd
from fabric.contrib.project import rsync_project

env.hosts = ['pi@raspberrypi.local']

def deploy():
    run('mkdir -p  ~/thermocork')
    rsync_project(local_dir='.', remote_dir='~/thermocork', exclude=['.git', '*.pyc', 'fabfile.py'])
    with cd('~/thermocork'):
        run('rm config.json')
        run('mv raspberry_config.json config.json')

def start():
    run('nohup homebridge -D -U ~/thermocork -P ~/thermocork/ >& ~/thermocork/tc.log < /dev/null &')
