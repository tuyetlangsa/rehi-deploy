public class ReviewFlashcard : IEndpoint
{
public void MapEndpoint(IEndpointRouteBuilder app)
{
app.MapPost("/flashcards/review", async ([FromBody] Request request, ISender sender) =>
{
var result = await sender.Send(new FlashcardScheduler.Command(
request.FlashcardId,
request.Feedback,
request.ReviewedAt));
})
.WithTags("Flashcards")
.RequireAuthorization()
.WithName("ReviewFlashcard");
}

    internal sealed class Request
    {
        public Guid FlashcardId { get; set; }
        public ReviewFeedback Feedback { get; set; }
        public long ReviewedAt { get; set; }
    }

}

namespace Rehi.Domain.Flashcards;

public enum FlashcardState
{
New,
Learning,
Review
}

public enum ReviewFeedback
{
Again,
Hard,
Good,
Easy
}

oke now I want to implement the flow for my defined space repetition.

I want when user click one of 4 feedback button, handle onclick will call the api I have implemented and auto next to the next flashcard.
