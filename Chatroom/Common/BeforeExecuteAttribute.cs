using System;

namespace Chatroom {
    [AttributeUsage(AttributeTargets.Method)]
    public abstract class BeforeExecuteAttribute : Attribute {
        public abstract void Validate();
    }
}
