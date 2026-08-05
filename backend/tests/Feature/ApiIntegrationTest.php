<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Resource;
use App\Models\Feedback;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ApiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $librarian;
    protected User $user;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
        $librarianRole = Role::firstOrCreate(['name' => 'Librarian']);
        $guestRole = Role::firstOrCreate(['name' => 'Guest']);

        // Create users
        $this->admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'status' => 'active',
        ]);
        $this->admin->assignRole($adminRole);

        $this->librarian = User::factory()->create([
            'role_id' => $librarianRole->id,
            'status' => 'active',
        ]);
        $this->librarian->assignRole($librarianRole);

        $this->user = User::factory()->create([
            'role_id' => $guestRole->id,
            'status' => 'active',
        ]);
        $this->user->assignRole($guestRole);

        // Create test category
        $this->category = Category::create([
            'name' => 'Computer Science',
            'description' => 'Books on software engineering',
        ]);
    }

    public function test_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/health');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'ok']);
    }

    public function test_user_authentication_flow(): void
    {
        $registerPayload = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'Secret123!',
            'password_confirmation' => 'Secret123!',
        ];

        $regResponse = $this->postJson('/api/register', $registerPayload);
        $regResponse->assertStatus(201)
                    ->assertJsonPath('success', true);

        $loginPayload = [
            'email' => 'john.doe@example.com',
            'password' => 'Secret123!',
        ];

        $loginResponse = $this->postJson('/api/login', $loginPayload);
        $loginResponse->assertStatus(200)
                      ->assertJsonPath('success', true);

        $token = $loginResponse->json('data.token');

        $profileResponse = $this->withHeader('Authorization', "Bearer {$token}")
                                ->getJson('/api/profile');
        $profileResponse->assertStatus(200)
                        ->assertJsonPath('data.email', 'john.doe@example.com');
    }

    public function test_categories_api(): void
    {
        $response = $this->getJson('/api/categories');
        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $token = $this->admin->createToken('test')->plainTextToken;

        $storeResponse = $this->withHeader('Authorization', "Bearer {$token}")
                              ->postJson('/api/categories', [
                                  'name' => 'Mathematics',
                                  'description' => 'Math papers',
                              ]);
        $storeResponse->assertStatus(201)
                      ->assertJsonPath('data.name', 'Mathematics');
    }

    public function test_resource_upload_and_pdf_stream(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $token = $this->librarian->createToken('test')->plainTextToken;

        $pdfFile = UploadedFile::fake()->create('sample.pdf', 100, 'application/pdf');

        $payload = [
            'category_id' => $this->category->id,
            'title' => 'Introduction to Algorithms',
            'description' => 'Comprehensive textbook',
            'author' => 'CLRS',
            'resource_type' => 'book',
            'language' => 'English',
            'pdf_file' => $pdfFile,
        ];

        $uploadResponse = $this->withHeader('Authorization', "Bearer {$token}")
                               ->postJson('/api/resources', $payload);

        $uploadResponse->assertStatus(201)
                       ->assertJsonPath('success', true);

        $resourceId = $uploadResponse->json('data.id');

        // Test PDF viewer endpoint with format=pdf for raw binary stream
        $viewerResponse = $this->withHeader('Authorization', "Bearer {$token}")
                               ->get("/api/resources/{$resourceId}/viewer?format=pdf");

        $viewerResponse->assertStatus(200)
                       ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_search_and_ai_endpoints(): void
    {
        $searchResponse = $this->getJson('/api/resources/search?q=Algorithms');
        $searchResponse->assertStatus(200)
                       ->assertJsonPath('success', true);

        $aiResponse = $this->postJson('/api/ai/chat', ['question' => 'What is an algorithm?']);
        $aiResponse->assertStatus(200)
                   ->assertJsonPath('success', true);
    }
}
