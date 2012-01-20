# Plugins

Sandbox uses standard `broadway` plugins from the Flatiron framework.
Since plugins could affect either the main program or the sandbox, they are separated out.

## Standard Plugins

Sandbox.timers - Add setTimeout / setInterval / clearInterval / clearTimeout

## Runner Plugins

Sandbox uses a runner in order to execute code.
This exists as a separate process spawned by Sandbox.
Place code here if you want to provide an API to a user of your Sandbox.

## Sandbox Plugins

Sandbox allows for plugins to hook into the communications, setup, and teardown of a runner.
Place code here to handle communication channels, preprocessors, etc.
