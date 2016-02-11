namespace Chatroom {
    public struct Msg {
        public int Id { get; set; }
        public int Reciever { get; set; }
        public string Words { get; set; }
        public bool Whisper { get; set; }
        public bool Valid { get; set; }
    }
    public enum ErrorState {
        Id = 1, Reciever = 2, Words = 4, Whisper = 8, RecieverNotFound = 16,
        RecieverLowerThanZero = 32
    }
}