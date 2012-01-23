# Staying Secure

Sandbox provides a secure execution environment.
However, one must take care to not expose insecure functions to the sandbox.

# Debug mode

When a debug mode is active, a sandbox can use a debugger statement to halt the program.
This can add complications if your program is using the debugger.

# Understanding the Object Wrapper

Sandbox uses a cross context (see v8 embedders guide) Object Wrapper, sometimes referred to as the bridge.
The Object wrapper helps to protect against cache invalidation and context attacks.
It produces read only copies of whatever is passed from the sandbox context to the parent and vice versa.
Functions are automatically GC'ed thanks to a WeakMap.

## Caveats

1. Setting values on properties does not propagate across the bridge, use a function.
   This is to prevent cache invalidation.
2. Functions are cached so properties on Gunctions will only propagate the *first* time it crosses the bridge.
   This is to prevent stack overflows from multiple wrappings across a bridge.
3. Some built ins are transferred as Object rather than their native counterparts (largely due to speed issues).
3. * ES Harmony Collections
4. The 'this' keyword will will be a copy when crossing the bridge

# Dangerous Functions

Some Functions should almost never be passed into the Sandbox.
These Functions allow for code from the Fandbox to execute outside the Sandbox context (and many other things).
Sandbox will allow these to be used so it is up to plugin authors and developers to audit the code.
Also, remember, that setting these Functions to properties of an Object will propagate them across the bridge.

1. eval
2. Function
3. String base evaluators such as setTimeout / setInterval / etc.
   Just wrap them and check for arguments of typeof X === 'string' to prevent this.
