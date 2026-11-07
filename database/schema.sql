-- DC Yapı Cam Balkon — içerik yönetim sistemi MySQL şeması
-- Önce Hostinger hPanel'den MySQL veritabanı oluşturun; bu dosyayı phpMyAdmin > İçe Aktar ile
-- o veritabanına yükleyin. Hostinger'ın verdiği önekli DB adını CREATE DATABASE/USE ile değiştirmeyin.
-- Görsel dosyaları MySQL BLOB veya base64 olarak değil, web kökünde /uploads/... yolunda saklanır.
-- Bu yol veya harici görsel URL'si içerik satırında tutulur.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(80) NOT NULL,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Argon2id veya bcrypt hash; düz parola saklamayın',
    role ENUM('admin', 'editor') NOT NULL DEFAULT 'admin',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    failed_login_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_users_username (username),
    KEY idx_admin_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Oturum çerezindeki rastgele token'ın kendisi yerine SHA-256 özeti saklanır.
CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    admin_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    user_agent VARCHAR(512) NULL,
    PRIMARY KEY (token_hash),
    KEY idx_admin_sessions_user_expiry (admin_user_id, expires_at),
    KEY idx_admin_sessions_expiry (expires_at),
    CONSTRAINT fk_admin_sessions_user
        FOREIGN KEY (admin_user_id) REFERENCES admin_users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sunucuda saklanan görsellerin dosya bilgileri. storage_path örneği: /uploads/blog/abc123.webp
CREATE TABLE IF NOT EXISTS media_assets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NOT NULL,
    width INT UNSIGNED NULL,
    height INT UNSIGNED NULL,
    sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    uploaded_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_media_assets_storage_path (storage_path),
    KEY idx_media_assets_uploader_date (uploaded_by, created_at),
    CONSTRAINT fk_media_assets_uploader
        FOREIGN KEY (uploaded_by) REFERENCES admin_users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_blog_categories_slug (slug),
    KEY idx_blog_categories_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(120) NOT NULL,
    slug VARCHAR(190) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    post_date DATE NOT NULL,
    excerpt VARCHAR(260) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    image_url TEXT NULL COMMENT 'Harici görsel URLsi; dosya yüklenmişse media_asset_id kullanın',
    media_asset_id BIGINT UNSIGNED NULL,
    meta_title VARCHAR(160) NULL,
    meta_description VARCHAR(320) NULL,
    published_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_blog_posts_slug (slug),
    KEY idx_blog_posts_public_date (status, published_at, post_date),
    KEY idx_blog_posts_category_date (category_id, post_date),
    CONSTRAINT fk_blog_posts_category
        FOREIGN KEY (category_id) REFERENCES blog_categories (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_blog_posts_media
        FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_blog_posts_created_by
        FOREIGN KEY (created_by) REFERENCES admin_users (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_blog_posts_updated_by
        FOREIGN KEY (updated_by) REFERENCES admin_users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_tags (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_blog_tags_slug (slug),
    UNIQUE KEY uq_blog_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_post_tags (
    blog_post_id BIGINT UNSIGNED NOT NULL,
    blog_tag_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (blog_post_id, blog_tag_id),
    KEY idx_blog_post_tags_tag (blog_tag_id, blog_post_id),
    CONSTRAINT fk_blog_post_tags_post
        FOREIGN KEY (blog_post_id) REFERENCES blog_posts (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_blog_post_tags_tag
        FOREIGN KEY (blog_tag_id) REFERENCES blog_tags (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gallery_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_gallery_categories_slug (slug),
    KEY idx_gallery_categories_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gallery_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    image_url TEXT NULL COMMENT 'Harici görsel URLsi; dosya yüklenmişse media_asset_id kullanın',
    media_asset_id BIGINT UNSIGNED NULL,
    caption VARCHAR(200) NULL,
    alt_text VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_gallery_items_public_order (is_published, category_id, sort_order, id),
    CONSTRAINT fk_gallery_items_category
        FOREIGN KEY (category_id) REFERENCES gallery_categories (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_gallery_items_media
        FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_gallery_items_created_by
        FOREIGN KEY (created_by) REFERENCES admin_users (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_gallery_items_updated_by
        FOREIGN KEY (updated_by) REFERENCES admin_users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Başlangıç kategorileri: admin panelindeki mevcut seçeneklerle eşleşir.
INSERT IGNORE INTO blog_categories (name, slug, sort_order) VALUES
    ('Cam balkon rehberi', 'cam-balkon-rehberi', 10),
    ('Ölçü ve tasarım', 'olcu-ve-tasarim', 20),
    ('Bakım ve kullanım', 'bakim-ve-kullanim', 30);

INSERT IGNORE INTO gallery_categories (name, slug, sort_order) VALUES
    ('Cam balkon', 'cam-balkon', 10),
    ('Sürme cam', 'surme-cam', 20),
    ('Giyotin cam', 'giyotin-cam', 30),
    ('Pergola', 'pergola', 40);

-- Güvenlik:
-- 1) Yönetici hesabını uygulamanın tek seferlik güvenli kurulum komutuyla oluşturun.
-- 2) password_hash alanına Argon2id veya bcrypt çıktısı yazın; düz parolayı SQL'e koymayın.
-- 3) Oturum çerezini Secure, HttpOnly ve SameSite=Lax olarak gönderin; session token'ının
--    yalnız SHA-256 özetini admin_sessions.token_hash alanında tutun.
-- 4) Yüklenen dosya türünü/boyutunu sunucuda doğrulayın, rastgele dosya adı üretin ve
--    image_url alanına base64/data URL kaydetmeyin.
-- 5) Public API yalnız published blog_posts ve is_published=1 gallery_items döndürmelidir.
