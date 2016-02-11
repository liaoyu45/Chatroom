using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Chatroom {
    [Table("Men")]
    public partial class Man {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }

        public string Basterds { get; set; }

        public DateTime RegisterTime { get; set; }
        public DateTime ActiveTime { get; set; }

        public bool Ignore(int basterd) {
            if ((this.Basterds ?? string.Empty).Split(',').Contains(basterd.ToString())) {
                return false;
            }
            this.Basterds += "," + basterd;
            return true;
        }
        public bool Check(string password) {
            return MD5.Encrypt(password) == this.Password;
        }
    }
}