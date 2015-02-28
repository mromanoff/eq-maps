require 'sinatra'
require 'kss'

assetsFolder = File.expand_path(File.dirname(__FILE__)) + '/../'

get '/index.html' do
  @styleguide = Kss::Parser.new(assetsFolder + 'sass')
  @sectionTemplate = 'index'

  begin
    erb @sectionTemplate.to_sym
  rescue Exception => e
    '<h1>Error parsing template</h1> ' + e.message
  end
end

get %r{^/((?<section> \d(\.\d)*)\.html)?$}x do
  @styleguide = Kss::Parser.new(assetsFolder + 'sass')

  if params[:section] then
    @sectionTemplate = 'sections/_' + params[:section]
  else
    @sectionTemplate = 'index'
  end

  begin
    erb @sectionTemplate.to_sym
  rescue Exception => e
    '<h1>Error parsing template</h1> ' + e.message
  end
end

get '/stylesheets/equinox.css' do
    content_type 'text/css'
    File.read(assetsFolder + 'css/equinox.css')
end

helpers do
  # Generates a styleguide block. A little bit evil with @_out_buf, but
  # if you're using something like Rails, you can write a much cleaner helper
  # very easily.
  def styleguide_block(section, &block)
    @section = @styleguide.section(section)
    @example_html = capture{ block.call }
    @escaped_html = ERB::Util.html_escape @example_html
    @_out_buf << erb(:_styleguide_block)
  end

  # Captures the result of a block within an erb template without spitting it
  # to the output buffer.
  def capture(&block)
    out, @_out_buf = @_out_buf, ""
    yield
    @_out_buf
  ensure
    @_out_buf = out
  end
end