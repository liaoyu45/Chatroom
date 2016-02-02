namespace Chatroom {
    public struct Msg {
        public int Id { get; set; }
        public int Reciever { get; set; }
        public string Words { get; set; }
        public bool Whisper { get; set; }
    }
}