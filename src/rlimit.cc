#include <sys/time.h>
#include <sys/resource.h>
#include <v8.h>
#include <node.h>
#include <errno.h>
#include <iostream>
#include <cstring>
using namespace v8;

Handle<Value> NodeUnref(const Arguments &args) {
  HandleScope scope;
  uv_unref(uv_default_loop());
  return scope.Close(Undefined());
}
Handle<Value> NodeRef(const Arguments &args) {
  HandleScope scope;
  uv_ref(uv_default_loop());
  return scope.Close(Undefined());
}

Handle<Value> NodeGetrlimit(const Arguments &args) {
  HandleScope scope;
  int resource = args[0]->IntegerValue();
  struct rlimit rl;
  Handle<Object> jslimit = Object::New();
  int result = getrlimit(resource, &rl);
  if (result != 0) {
    ThrowException(Exception::Error(String::New(strerror(result))));
    return scope.Close(Undefined());
  }
  jslimit->Set(String::New("rlim_cur"), Number::New(rl.rlim_cur));
  jslimit->Set(String::New("rlim_max"), Number::New(rl.rlim_max));
  return scope.Close(jslimit);
}

Handle<Value> NodeGetrusage(const Arguments &args) {
  HandleScope scope;
  int who = args[0]->IntegerValue();
  struct rusage ru;
  Handle<Object> jsusage = Object::New();
  int result = getrusage(who, &ru);
  if (result != 0) {
    ThrowException(Exception::Error(String::New(strerror(result))));
    return scope.Close(Undefined());
  }
  jsusage->Set(String::New("ru_utime"), Number::New(
          (static_cast<double>(ru.ru_utime.tv_sec) * 1000000) +
          (static_cast<double>(ru.ru_utime.tv_usec))
  ));
  jsusage->Set(String::New("ru_stime"), Number::New(
          (static_cast<double>(ru.ru_stime.tv_sec) * 1000000) +
          (static_cast<double>(ru.ru_stime.tv_usec))
  ));
  jsusage->Set(String::New("ru_maxrss"), Number::New(ru.ru_maxrss));
  jsusage->Set(String::New("ru_ixrss"), Number::New(ru.ru_ixrss));
  jsusage->Set(String::New("ru_idrss"), Number::New(ru.ru_idrss));
  jsusage->Set(String::New("ru_isrss"), Number::New(ru.ru_isrss));
  jsusage->Set(String::New("ru_minflt"), Number::New(ru.ru_minflt));
  jsusage->Set(String::New("ru_majflt"), Number::New(ru.ru_majflt));
  jsusage->Set(String::New("ru_nswap"), Number::New(ru.ru_nswap));
  jsusage->Set(String::New("ru_inblock"), Number::New(ru.ru_inblock));
  jsusage->Set(String::New("ru_oublock"), Number::New(ru.ru_oublock));
  jsusage->Set(String::New("ru_msgsnd"), Number::New(ru.ru_msgsnd));
  jsusage->Set(String::New("ru_msgrcv"), Number::New(ru.ru_msgrcv));
  jsusage->Set(String::New("ru_nsignals"), Number::New(ru.ru_nsignals));
  jsusage->Set(String::New("ru_nvcsw"), Number::New(ru.ru_nvcsw));
  jsusage->Set(String::New("ru_nivcsw"), Number::New(ru.ru_nivcsw));
  return scope.Close(jsusage);
}

Handle<Value> NodeSetrlimit(const Arguments &args) {
  HandleScope scope;
  int resource = args[0]->IntegerValue();
  struct rlimit rl;
  Handle<Object> jslimit = args[1]->ToObject();
  rl.rlim_cur = jslimit->Get(String::New("rlim_cur"))->IntegerValue();
  rl.rlim_max = jslimit->Get(String::New("rlim_max"))->IntegerValue();
  int result = setrlimit(resource, &rl);
  if (result != 0) {
    ThrowException(Exception::Error(String::New(strerror(result))));
    return scope.Close(Undefined());
  }
  return scope.Close(Number::New(result));
}

void Initialize(Handle<Object> target) {
  HandleScope scope;
  target->Set(String::New("unref"),FunctionTemplate::New(NodeUnref)->GetFunction());
  target->Set(String::New("ref"),FunctionTemplate::New(NodeRef)->GetFunction());
  target->Set(String::New("getrlimit"),FunctionTemplate::New(NodeGetrlimit)->GetFunction());
  target->Set(String::New("getrusage"),FunctionTemplate::New(NodeGetrusage)->GetFunction());
  target->Set(String::New("setrlimit"),FunctionTemplate::New(NodeSetrlimit)->GetFunction());
  target->Set(String::New("RLIM_INFINITY"),Number::New(RLIM_INFINITY));
  target->Set(String::New("RLIMIT_AS"),Number::New(RLIMIT_AS));
  target->Set(String::New("RLIMIT_CORE"),Number::New(RLIMIT_CORE));
  target->Set(String::New("RLIMIT_DATA"),Number::New(RLIMIT_DATA));
  target->Set(String::New("RLIMIT_FSIZE"),Number::New(RLIMIT_FSIZE));
  target->Set(String::New("RLIMIT_LOCKS"),Number::New(RLIMIT_LOCKS));
  target->Set(String::New("RLIMIT_MEMLOCK"),Number::New(RLIMIT_MEMLOCK));
  target->Set(String::New("RLIMIT_MEMLOCK"),Number::New(RLIMIT_MEMLOCK));
  target->Set(String::New("RLIMIT_MSGQUEUE"),Number::New(RLIMIT_MSGQUEUE));
  target->Set(String::New("RLIMIT_NICE"),Number::New(RLIMIT_NICE));
  target->Set(String::New("RLIMIT_NOFILE"),Number::New(RLIMIT_NOFILE));
  target->Set(String::New("RLIMIT_NPROC"),Number::New(RLIMIT_NPROC));
  target->Set(String::New("RLIMIT_RSS"),Number::New(RLIMIT_RSS));
  target->Set(String::New("RLIMIT_RTPRIO"),Number::New(RLIMIT_RTPRIO));
  target->Set(String::New("RLIMIT_RTTIME"),Number::New(RLIMIT_RTTIME));
  target->Set(String::New("RLIMIT_SIGPENDING"),Number::New(RLIMIT_SIGPENDING));
  target->Set(String::New("RLIMIT_STACK"),Number::New(RLIMIT_STACK));
  target->Set(String::New("EFAULT"),Number::New(EFAULT));
  target->Set(String::New("EINVAL"),Number::New(EINVAL));
  target->Set(String::New("EPERM"),Number::New(EPERM));
  target->Set(String::New("ESRCH"),Number::New(ESRCH));
  scope.Close(Undefined());
}
NODE_MODULE(rlimit, Initialize)
