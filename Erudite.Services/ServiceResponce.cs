namespace Erudite.Services
{
    public class ServiceResponce<T>
    {
      public bool IsSuccess { get; set; }=false;
      public string Message { get; set; }="";
      public T Data { get; set; }
        
    }
}