using System.ComponentModel.DataAnnotations;

namespace Chatroom {
    public class Friend {
        [Key]
        public string YouAndMe { get; set; }
    }
}