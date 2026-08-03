<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Resource>
 */
class ResourceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'uploaded_by' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'author' => fake()->name(),
            'publisher' => fake()->company(),
            'publication_year' => fake()->year(),
            'isbn' => fake()->isbn13(),
            'language' => 'English',
            'resource_type' => fake()->randomElement(['book', 'paper', 'manual', 'report']),
            'keywords' => implode(', ', fake()->words(5)),
            'cover_image' => null,
            'pdf_path' => 'resources/sample.pdf',
            'status' => 'published',
        ];
    }
}
