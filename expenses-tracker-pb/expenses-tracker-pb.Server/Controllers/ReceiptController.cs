using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

public class GoogleDriveService
{
	public DriveService GetDriveService(string[] scopes, string applicationName, string serviceAccountKeyPath)
	{
		return CreateDriveService(scopes, applicationName,serviceAccountKeyPath);
	}
	public DriveService CreateDriveService(string[] scopes, string applicationName, string serviceAccountKeyPath)
	{
		GoogleCredential credential;
		using (var stream = new FileStream(serviceAccountKeyPath, FileMode.Open, FileAccess.Read))
		{
			credential = GoogleCredential.FromStream(stream)
				.CreateScoped(scopes);
		}

		return new DriveService(new BaseClientService.Initializer()
		{
			HttpClientInitializer = credential,
			ApplicationName = applicationName,
		});
	}
}

[ApiController]
[Route("api/receipt")]
public class ReceiptController : ControllerBase
{
	private readonly GoogleDriveService _googleDriveService;
	private readonly string[] _scopes = { DriveService.Scope.Drive };
	private readonly string _applicationName = "Google Drive API";
	private readonly string _uploadAccountKeyPath = "C:\\Users\\pczyz\\Desktop\\credentials.json";
	private readonly string _viewAccountKeyPath = "C:\\Users\\pczyz\\Desktop\\credentials-view.json";

	public ReceiptController(GoogleDriveService googleDriveService)
	{
		_googleDriveService = googleDriveService;
	}

	[HttpPost("upload")]
	public async Task<IActionResult> Upload([FromForm] string fileName, [FromForm] IFormFile file)
	{
		if (file == null || file.Length == 0)
		{
			return BadRequest("No file uploaded.");
		}

		try
		{
			Console.WriteLine($"Received file: {file.FileName}");

			// Pobranie Id użytkownika
			var folderName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			var service = _googleDriveService.GetDriveService(_scopes, _applicationName, _uploadAccountKeyPath);

			var folderId = await FindUserFolder(service, folderName);
			if (string.IsNullOrEmpty(folderId))
			{
				folderId = await CreateUserFolder(service, folderName);
			}

			var fileMetadata = new Google.Apis.Drive.v3.Data.File()
			{
				Name = fileName,
				Parents = new List<string> { folderId },
			};

			using (var memoryStream = new MemoryStream())
			{
				await file.CopyToAsync(memoryStream);
				var fileStream = new MemoryStream(memoryStream.ToArray());

				var request = service.Files.Create(fileMetadata, fileStream, file.ContentType);
				request.Fields = "id";
				var response = request.Upload();
				var uploadedFile = request.ResponseBody;

				return Ok($"File uploaded successfully. File ID: {uploadedFile.Id}");
			}
		}
		catch (Exception ex)
		{
			Console.WriteLine($"Error uploading file: {ex.Message}. Stack Trace: {ex.StackTrace}");
			return StatusCode(500, $"Error uploading file: {ex.Message}. Stack Trace: {ex.StackTrace}");
		}
	}
	private async Task<string> FindUserFolder(DriveService service, string folderName)
	{
		try
		{
			var listRequest = service.Files.List();
			listRequest.Q = $"name = '{folderName}' and mimeType = 'application/vnd.google-apps.folder' and '1I1d5Qvrqntmiy9QyVgTaTrzSXrlHQriW' in parents";
			var folders = await listRequest.ExecuteAsync();

			if (folders.Files.Any())
			{
				Console.WriteLine($"User folder exists. ID: {folders.Files.First().Id}");
				return folders.Files.First().Id;
			}
			else
			{
				Console.WriteLine($"User folder does not exist.");
				return null;
			}
		}
		catch (Exception ex)
		{
			Console.WriteLine($"Error finding user folder: {ex.Message}. Stack Trace: {ex.StackTrace}");
			throw;
		}
	}
	private async Task<string> CreateUserFolder(DriveService service, string folderName)
	{
		try
		{
			Console.WriteLine($"Creating new user folder");

			var folderMetadata = new Google.Apis.Drive.v3.Data.File()
			{
				Name = folderName,
				MimeType = "application/vnd.google-apps.folder",
				Parents = new List<string> { "1I1d5Qvrqntmiy9QyVgTaTrzSXrlHQriW" },
			};

			var request = service.Files.Create(folderMetadata);
			request.Fields = "id";

			var folder = await request.ExecuteAsync();
			//Console.WriteLine($"New user folder created. ID: {folder.Id}");

			return folder.Id;
		}
		catch (Exception ex)
		{
			//Console.WriteLine($"Error creating user folder: {ex.Message}. Stack Trace: {ex.StackTrace}");
			throw;
		}
	}

	[HttpGet("userfolder")]
	public async Task<IActionResult> GetUserFolderLink()
	{
		try
		{
			var folderName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var service = _googleDriveService.GetDriveService(_scopes, _applicationName, _viewAccountKeyPath);
			var folderId = await FindUserFolder(service, folderName);

			if (string.IsNullOrEmpty(folderId))
			{
				return NotFound("User folder not found.");
			}

			var folderLink = $"https://drive.google.com/drive/folders/{folderId}";
			return Ok(folderLink);
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Error: {ex.Message}");
		}
	}

	[HttpGet("photos")]
	public async Task<IActionResult> GetPhotos()
	{
		try
		{
			var folderName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var service = _googleDriveService.GetDriveService(_scopes, _applicationName, _uploadAccountKeyPath);
			var folderId = await FindUserFolder(service, folderName);

			if (string.IsNullOrEmpty(folderId))
			{
				return NotFound("User folder not found.");
			}

			var listRequest = service.Files.List();
			listRequest.Q = $"'{folderId}' in parents";
			var files = await listRequest.ExecuteAsync();

			var photoUrls = new List<string>();
			foreach (var file in files.Files)
			{
				if (file.MimeType.StartsWith("image/"))
				{
					var thumbnailUrl = $"https://drive.google.com/thumbnail?id={file.Id}";
					photoUrls.Add(thumbnailUrl);
					//Console.WriteLine($"Link:{thumbnailUrl}, File: {file.Name}, ID: {file.Id}, MIME Type: {file.MimeType}");
				}
			}

			return Ok(photoUrls);
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Error: {ex.Message}");
		}
	}
}
