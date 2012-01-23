# Options

Sandbox uses `nconf` to store options.

## Standard Options

rlimit - resource limit object
rlimit.timeout - time to live in milliseconds (may be rounded to second according to kernel).
rlimit.memory - maximum memory to use

options.persistent - keeps the runner alive until manually killed
options.exitOnError - forcibly exit when an error occurs (generally used for out of band errors via timers)
